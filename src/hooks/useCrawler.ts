/**
 * 크롤링 작업 관리를 위한 Custom Hook
 * Resumable Crawling 기능 지원
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AxiosError } from 'axios';
import { crawlerApi } from '../api/endpoints/crawler.api';
import type {
  CollectMetadataRequest,
  JobStatus,
  JobStatusResponse,
  RefreshDetailsRequest,
} from '../types/api/admin.types';

export type CrawlerType = 'metadata' | 'details' | 'detailsRefresh' | 'language';
export type CrawlerStartParams = CollectMetadataRequest | RefreshDetailsRequest;

export type CrawlerStatus = 'IDLE' | 'LOADING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ProgressHistoryPoint {
  timestamp: number; // Unix timestamp (밀리초)
  progress: number; // 0~100
  processedCount: number;
}

export interface CrawlerState {
  status: CrawlerStatus;
  backendStatus: JobStatus | null;
  jobId: string | null;
  startedAt: number | null; // Unix timestamp (초)
  completedAt: number | null; // Unix timestamp (초)
  lastUpdatedAt: number | null; // Unix timestamp (밀리초)
  retryCount: number; // 네트워크 재시도 횟수
  progress: number; // 0~100
  processedCount: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  estimatedRemainingSeconds: number | null;
  errorMessage: string | null;
  startProblemId?: number;
  endProblemId?: number;
  lastCheckpointId?: number | string | null; // checkpoint 정보 (실패 시 재시작용)
  progressHistory: ProgressHistoryPoint[]; // 진행률 히스토리
}

interface UseCrawlerOptions {
  type: CrawlerType;
  pollInterval?: number; // 폴링 간격 (밀리초, 기본값: 2000)
  onComplete?: (state: CrawlerState) => void;
  onError?: (error: Error) => void;
}

interface UseCrawlerReturn {
  state: CrawlerState;
  start: (params?: CrawlerStartParams) => Promise<void>;
  restart: (params?: CrawlerStartParams) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
}

const initialState: CrawlerState = {
  status: 'IDLE',
  backendStatus: null,
  jobId: null,
  startedAt: null,
  completedAt: null,
  lastUpdatedAt: null,
  retryCount: 0,
  progress: 0,
  processedCount: 0,
  totalCount: 0,
  successCount: 0,
  failCount: 0,
  estimatedRemainingSeconds: null,
  errorMessage: null,
  progressHistory: [],
};

export const useCrawler = (options: UseCrawlerOptions): UseCrawlerReturn => {
  const { type, pollInterval = 2000, onComplete, onError } = options;
  const [state, setState] = useState<CrawlerState>(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);
  const consecutiveErrorCountRef = useRef(0);
  const stateRef = useRef<CrawlerState>(initialState); // 현재 상태를 ref로 추적
  const MAX_CONSECUTIVE_ERRORS = 5; // 연속 에러 5회 발생 시 폴링 중단
  const PENDING_POLL_INTERVAL_MS = 5000;
  const MAX_BACKOFF_MS = 15000;

  // 상태 조회 API 선택
  const getStatusApi = useCallback(
    (jobId: string): Promise<JobStatusResponse | null> => {
      switch (type) {
        case 'metadata':
          return crawlerApi.getMetadataCollectStatus(jobId);
        case 'details':
          return crawlerApi.getDetailsCollectStatus(jobId);
        case 'detailsRefresh':
          return crawlerApi.getRefreshDetailsStatus(jobId);
        case 'language':
          return crawlerApi.getLanguageUpdateStatus(jobId);
        default:
          throw new Error(`Unknown crawler type: ${type}`);
      }
    },
    [type]
  );

  // 작업 시작 API 선택
  const startApi = useCallback(
    async (params?: CrawlerStartParams): Promise<{ jobId: string }> => {
      switch (type) {
        case 'metadata':
          if (!params) {
            throw new Error('Metadata collection requires start and end parameters');
          }
          return crawlerApi.collectMetadata(params as CollectMetadataRequest);
        case 'details':
          return crawlerApi.collectDetails();
        case 'detailsRefresh':
          return crawlerApi.refreshDetails(params as RefreshDetailsRequest | undefined);
        case 'language':
          return crawlerApi.updateLanguage();
        default:
          throw new Error(`Unknown crawler type: ${type}`);
      }
    },
    [type]
  );

  // 폴링 중지 (먼저 정의하여 pollStatus에서 사용 가능하도록)
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isPollingRef.current = false;
    consecutiveErrorCountRef.current = 0;
  }, []);

  // 상태 폴링
  const pollStatus = useCallback(
    async (jobId: string) => {
      // 이미 폴링 중이면 중복 방지
      if (isPollingRef.current) {
        return;
      }

      isPollingRef.current = true;

      try {
        const status = await getStatusApi(jobId);

        if (!status) {
          // 404 에러: 작업을 찾을 수 없음 (24시간 후 자동 삭제)
          const failedState: CrawlerState = {
            ...stateRef.current,
            status: 'FAILED',
            backendStatus: 'FAILED',
            errorMessage: `작업 상태를 찾을 수 없습니다. (jobId: ${jobId})`,
            lastUpdatedAt: Date.now(),
            progressHistory: stateRef.current.progressHistory || [],
          };
          setState(failedState);
          stateRef.current = failedState;
          stop();
          consecutiveErrorCountRef.current = 0;
          return;
        }

        // 성공적으로 상태를 가져왔으므로 에러 카운트 초기화
        consecutiveErrorCountRef.current = 0;

        // 진행률 히스토리 업데이트 (진행률이 변경되었을 때만 추가)
        let finalState: CrawlerState | null = null;
        setState((prev) => {
          const totalCountByRange =
            status.startProblemId && status.endProblemId
              ? status.endProblemId - status.startProblemId + 1
              : 0;
          const effectiveTotalCount = status.totalCount > 0 ? status.totalCount : totalCountByRange;
          const computedProgress =
            effectiveTotalCount > 0
              ? Math.min(100, Math.floor((status.processedCount / effectiveTotalCount) * 100))
              : status.progressPercentage;
          const normalizedProgress = Math.max(status.progressPercentage, computedProgress);
          const currentTime = Date.now();
          const prevHistory = prev.progressHistory || [];
          const progressChanged = prev.progress !== normalizedProgress;
          const processedChanged = prev.processedCount !== status.processedCount;
          const shouldAppendHistory = progressChanged || processedChanged;
          const newHistory = shouldAppendHistory
            ? [
                ...prevHistory,
                {
                  timestamp: currentTime,
                  progress: normalizedProgress,
                  processedCount: status.processedCount,
                },
              ]
            : prevHistory;

          // 최근 100개 포인트만 유지 (메모리 최적화)
          const trimmedHistory = newHistory.slice(-100);

        const newState: CrawlerState = {
          status: status.status === 'COMPLETED' ? 'COMPLETED' : status.status === 'FAILED' ? 'FAILED' : 'RUNNING',
          backendStatus: status.status,
          jobId: status.jobId,
          startedAt: status.startedAt ?? prev.startedAt,
          completedAt: status.completedAt ?? null,
          lastUpdatedAt: Date.now(),
          retryCount: 0,
          progress: normalizedProgress,
          processedCount: status.processedCount,
          totalCount: effectiveTotalCount,
          successCount: status.successCount,
          failCount: status.failCount,
          estimatedRemainingSeconds: status.estimatedRemainingSeconds,
          errorMessage: status.errorMessage,
          startProblemId: status.startProblemId,
          endProblemId: status.endProblemId,
          lastCheckpointId: status.lastCheckpointId,
          progressHistory: trimmedHistory,
        };

        finalState = newState;
        stateRef.current = newState; // ref 업데이트
        return newState;
        });

        // 완료 또는 실패 시 폴링 중지
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          stop();
          consecutiveErrorCountRef.current = 0;
          if (finalState) {
            if (status.status === 'COMPLETED' && onComplete) {
              onComplete(finalState);
            }
            if (status.status === 'FAILED') {
              // 실패했지만 lastCheckpointId가 있으면 재시작 가능
              if (status.lastCheckpointId) {
                // 에러 메시지에 checkpoint 정보 추가
                const checkpointMessage = typeof status.lastCheckpointId === 'number'
                  ? `${status.errorMessage || '작업이 실패했습니다.'} (마지막 처리 위치: ${status.lastCheckpointId}번)`
                  : `${status.errorMessage || '작업이 실패했습니다.'} (마지막 처리 위치: ${status.lastCheckpointId})`;
                setState((prev) => ({
                  ...prev,
                  errorMessage: checkpointMessage,
                  lastUpdatedAt: Date.now(),
                }));
              }
              if (onError) {
                onError(new Error(status.errorMessage || '작업이 실패했습니다.'));
              }
            }
          }
        }
      } catch (error) {
        consecutiveErrorCountRef.current += 1;

        // 연속 에러가 너무 많이 발생하면 폴링 중단
        if (consecutiveErrorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
          const errorMessage = error instanceof Error ? error.message : '상태 조회에 실패했습니다.';
          const failedState: CrawlerState = {
            ...stateRef.current,
            status: 'FAILED',
            backendStatus: 'FAILED',
            errorMessage: `연속 ${MAX_CONSECUTIVE_ERRORS}회 상태 조회 실패: ${errorMessage}`,
            retryCount: consecutiveErrorCountRef.current,
            lastUpdatedAt: Date.now(),
            progressHistory: stateRef.current.progressHistory || [],
          };
          setState(failedState);
          stateRef.current = failedState;
          stop();
          consecutiveErrorCountRef.current = 0;
          if (onError) {
            onError(error instanceof Error ? error : new Error(errorMessage));
          }
          return;
        }

        const axiosError = error as AxiosError<{ message?: string }>;
        const statusCode = axiosError.response?.status;
        if (statusCode === 404) {
          const failedState: CrawlerState = {
            ...stateRef.current,
            status: 'FAILED',
            backendStatus: 'FAILED',
            errorMessage: `작업 상태를 찾을 수 없습니다. (jobId: ${jobId})`,
            retryCount: consecutiveErrorCountRef.current,
            lastUpdatedAt: Date.now(),
            progressHistory: stateRef.current.progressHistory || [],
          };
          setState(failedState);
          stateRef.current = failedState;
          stop();
          consecutiveErrorCountRef.current = 0;
          return;
        }

        if (statusCode === 400) {
          const failedState: CrawlerState = {
            ...stateRef.current,
            status: 'FAILED',
            backendStatus: 'FAILED',
            errorMessage:
              axiosError.response?.data?.message ||
              '요청 파라미터가 유효하지 않습니다. start/end 범위를 확인해주세요.',
            retryCount: consecutiveErrorCountRef.current,
            lastUpdatedAt: Date.now(),
            progressHistory: stateRef.current.progressHistory || [],
          };
          setState(failedState);
          stateRef.current = failedState;
          stop();
          consecutiveErrorCountRef.current = 0;
          return;
        }

        // 일시적인 네트워크 에러인 경우 다음 폴링 시도는 계속 진행
        // 상태를 업데이트하지 않고 조용히 재시도 (로그만 남김)
        setState((prev) => ({
          ...prev,
          retryCount: consecutiveErrorCountRef.current,
          lastUpdatedAt: Date.now(),
        }));
        console.warn(`상태 조회 실패 (${consecutiveErrorCountRef.current}/${MAX_CONSECUTIVE_ERRORS}):`, error);
      } finally {
        isPollingRef.current = false;
      }
    },
    [getStatusApi, onComplete, onError, stop]
  );

  const getNextPollDelay = useCallback((): number => {
    const backendStatus = stateRef.current.backendStatus;
    const base = backendStatus === 'PENDING' ? PENDING_POLL_INTERVAL_MS : pollInterval;
    const backoff = Math.min(MAX_BACKOFF_MS, pollInterval * Math.max(0, consecutiveErrorCountRef.current - 1));
    return base + backoff;
  }, [pollInterval]);

  // 폴링 시작 (setTimeout 기반 동적 폴링)
  const startPolling = useCallback(
    (jobId: string) => {
      stop(); // 기존 폴링 중지

      const runPoll = async () => {
        const currentStatus = stateRef.current.status;
        if (currentStatus !== 'RUNNING' && currentStatus !== 'LOADING') {
          stop();
          return;
        }
        await pollStatus(jobId);
        const nextStatus = stateRef.current.status;
        if (nextStatus !== 'RUNNING' && nextStatus !== 'LOADING') {
          stop();
          return;
        }
        timerRef.current = setTimeout(runPoll, getNextPollDelay());
      };

      runPoll();
    },
    [getNextPollDelay, pollStatus, stop]
  );

  // 작업 시작
  const start = useCallback(
    async (params?: CrawlerStartParams) => {
      if (state.status === 'LOADING' || state.status === 'RUNNING') {
        return; // 이미 실행 중
      }

      setState((prev) => ({
        ...prev,
        status: 'LOADING',
        backendStatus: 'PENDING',
        startedAt: null,
        completedAt: null,
        lastUpdatedAt: Date.now(),
        retryCount: 0,
        errorMessage: null,
        progressHistory: [],
      }));

      try {
        const result = await startApi(params);
        setState((prev) => ({
          ...prev,
          status: 'RUNNING',
          backendStatus: 'PENDING',
          jobId: result.jobId,
          lastUpdatedAt: Date.now(),
        }));
        startPolling(result.jobId);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string; jobId?: string }>;

        if (axiosError.response?.status === 400) {
          const badRequestMessage =
            axiosError.response.data?.message ||
            '요청 범위가 유효하지 않습니다. start/end를 함께 입력하고 start <= end인지 확인해주세요.';
          setState((prev) => ({
            ...prev,
            status: 'FAILED',
            backendStatus: 'FAILED',
            errorMessage: badRequestMessage,
            retryCount: 0,
            lastUpdatedAt: Date.now(),
          }));
          if (onError) {
            onError(new Error(badRequestMessage));
          }
          throw error;
        }

        // 타임아웃 처리: jobId가 있으면 상태 조회하여 checkpoint 확인
        const isTimeout = axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout');
        
        if (isTimeout && axiosError.response?.data?.jobId) {
          // 타임아웃 발생했지만 jobId를 받은 경우
          const jobId = axiosError.response.data.jobId;
          try {
            // 상태 조회하여 lastCheckpointId 확인
            const status = await getStatusApi(jobId);
            if (status?.lastCheckpointId) {
              // checkpoint가 있으면 RUNNING 상태로 설정하고 폴링 시작
              setState((prev) => ({
                ...prev,
                status: 'RUNNING',
                backendStatus: status.status,
                jobId,
                startedAt: status.startedAt ?? prev.startedAt,
                completedAt: status.completedAt ?? null,
                lastUpdatedAt: Date.now(),
                lastCheckpointId: status.lastCheckpointId,
                errorMessage: null,
              }));
              startPolling(jobId);
              return; // 에러를 throw하지 않음
            }
          } catch {
            // 상태 조회 실패 시 일반 에러 처리
          }
        }
        
        const errorMessage = error instanceof Error ? error.message : '작업 시작에 실패했습니다.';
        setState((prev) => ({
          ...prev,
          status: 'FAILED',
          backendStatus: 'FAILED',
          retryCount: 0,
          lastUpdatedAt: Date.now(),
          errorMessage,
        }));
        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage));
        }
        throw error;
      }
    },
    [state.status, startApi, startPolling, onError, getStatusApi]
  );

  // 재시작 (이어하기)
  const restart = useCallback(
    async (params?: CrawlerStartParams) => {
      // 메타데이터 수집의 경우: lastCheckpointId + 1부터 시작
      if (type === 'metadata' && state.lastCheckpointId && typeof state.lastCheckpointId === 'number') {
        const checkpointStart = state.lastCheckpointId + 1;
        const originalEnd = params?.end || state.endProblemId || checkpointStart;
        const newParams: CollectMetadataRequest = {
          start: checkpointStart,
          end: originalEnd,
        };
        await start(newParams);
      } else {
        // 상세 정보/언어 업데이트: 같은 API를 다시 호출하면 백엔드가 checkpoint부터 자동으로 이어서 진행
        await start(params);
      }
    },
    [start, type, state.lastCheckpointId, state.endProblemId]
  );

  // state 변경 시 stateRef 동기화
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    state,
    start,
    restart,
    stop,
    isLoading: state.status === 'LOADING',
  };
};
