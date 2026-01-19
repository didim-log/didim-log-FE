/**
 * 크롤링 작업 관리를 위한 Custom Hook
 * Resumable Crawling 기능 지원
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { crawlerApi } from '../api/endpoints/crawler.api';
import type { CollectMetadataRequest, JobStatusResponse } from '../types/api/admin.types';

export type CrawlerType = 'metadata' | 'details' | 'language';

export type CrawlerStatus = 'IDLE' | 'LOADING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ProgressHistoryPoint {
  timestamp: number; // Unix timestamp (밀리초)
  progress: number; // 0~100
  processedCount: number;
}

export interface CrawlerState {
  status: CrawlerStatus;
  jobId: string | null;
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
  start: (params?: CollectMetadataRequest) => Promise<void>;
  restart: (params?: CollectMetadataRequest) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
}

const initialState: CrawlerState = {
  status: 'IDLE',
  jobId: null,
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const consecutiveErrorCountRef = useRef(0);
  const stateRef = useRef<CrawlerState>(initialState); // 현재 상태를 ref로 추적
  const MAX_CONSECUTIVE_ERRORS = 5; // 연속 에러 5회 발생 시 폴링 중단

  // 상태 조회 API 선택
  const getStatusApi = useCallback(
    (jobId: string): Promise<JobStatusResponse | null> => {
      switch (type) {
        case 'metadata':
          return crawlerApi.getMetadataCollectStatus(jobId);
        case 'details':
          return crawlerApi.getDetailsCollectStatus(jobId);
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
    async (params?: CollectMetadataRequest): Promise<{ jobId: string }> => {
      switch (type) {
        case 'metadata':
          if (!params) {
            throw new Error('Metadata collection requires start and end parameters');
          }
          return crawlerApi.collectMetadata(params);
        case 'details':
          return crawlerApi.collectDetails();
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // setInterval이므로 clearInterval 사용
      intervalRef.current = null;
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
            errorMessage: '작업을 찾을 수 없습니다. 새로 시작해주세요.',
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
          const currentTime = Date.now();
          const prevHistory = prev.progressHistory || [];
          const progressChanged = prev.progress !== status.progressPercentage;
          const newHistory = progressChanged
            ? [
                ...prevHistory,
                {
                  timestamp: currentTime,
                  progress: status.progressPercentage,
                  processedCount: status.processedCount,
                },
              ]
            : prevHistory;

          // 최근 100개 포인트만 유지 (메모리 최적화)
          const trimmedHistory = newHistory.slice(-100);

        const newState: CrawlerState = {
          status: status.status === 'COMPLETED' ? 'COMPLETED' : status.status === 'FAILED' ? 'FAILED' : 'RUNNING',
          jobId: status.jobId,
          progress: status.progressPercentage,
          processedCount: status.processedCount,
          totalCount: status.totalCount,
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
            errorMessage: `연속 ${MAX_CONSECUTIVE_ERRORS}회 상태 조회 실패: ${errorMessage}`,
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

        // 일시적인 네트워크 에러인 경우 다음 폴링 시도는 계속 진행
        // 상태를 업데이트하지 않고 조용히 재시도 (로그만 남김)
        console.warn(`상태 조회 실패 (${consecutiveErrorCountRef.current}/${MAX_CONSECUTIVE_ERRORS}):`, error);
      } finally {
        isPollingRef.current = false;
      }
    },
    [getStatusApi, onComplete, onError, stop]
  );

  // 폴링 시작 (간단한 setInterval 방식)
  const startPolling = useCallback(
    (jobId: string) => {
      stop(); // 기존 폴링 중지

      // 즉시 한 번 조회
      pollStatus(jobId);

      // 주기적으로 폴링
      intervalRef.current = setInterval(() => {
        // ref로 현재 상태 확인 (setState 내부에서 확인하지 않음)
        const currentStatus = stateRef.current.status;
        if (currentStatus === 'RUNNING' || currentStatus === 'LOADING') {
          // RUNNING 또는 LOADING 상태인 경우에만 폴링 실행
          pollStatus(jobId);
        } else {
          // RUNNING이 아니면 폴링 중지
          stop();
        }
      }, pollInterval);
    },
    [pollStatus, pollInterval, stop]
  );

  // 작업 시작
  const start = useCallback(
    async (params?: CollectMetadataRequest) => {
      if (state.status === 'LOADING' || state.status === 'RUNNING') {
        return; // 이미 실행 중
      }

      setState((prev) => ({
        ...prev,
        status: 'LOADING',
        errorMessage: null,
        progressHistory: prev.progressHistory || [], // 새 작업 시작 시 히스토리 초기화 (기존 값이 없으면 빈 배열)
      }));

      try {
        const result = await startApi(params);
        setState((prev) => ({
          ...prev,
          status: 'RUNNING',
          jobId: result.jobId,
        }));
        startPolling(result.jobId);
      } catch (error) {
        // 타임아웃 처리: jobId가 있으면 상태 조회하여 checkpoint 확인
        const axiosError = error as { code?: string; message?: string };
        const isTimeout = axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout');
        
        if (isTimeout && error.response?.data?.jobId) {
          // 타임아웃 발생했지만 jobId를 받은 경우
          const jobId = error.response.data.jobId;
          try {
            // 상태 조회하여 lastCheckpointId 확인
            const status = await getStatusApi(jobId);
            if (status?.lastCheckpointId) {
              // checkpoint가 있으면 RUNNING 상태로 설정하고 폴링 시작
              setState((prev) => ({
                ...prev,
                status: 'RUNNING',
                jobId,
                lastCheckpointId: status.lastCheckpointId,
                errorMessage: null,
              }));
              startPolling(jobId);
              return; // 에러를 throw하지 않음
            }
          } catch (statusError) {
            // 상태 조회 실패 시 일반 에러 처리
          }
        }
        
        const errorMessage = error instanceof Error ? error.message : '작업 시작에 실패했습니다.';
        setState((prev) => ({
          ...prev,
          status: 'FAILED',
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
    async (params?: CollectMetadataRequest) => {
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
