/**
 * 크롤링 작업 관리를 위한 Custom Hook
 * Resumable Crawling 기능 지원
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { crawlerApi } from '../api/endpoints/crawler.api';
import type { CollectMetadataRequest, JobStatusResponse } from '../types/api/admin.types';

export type CrawlerType = 'metadata' | 'details' | 'language';

export type CrawlerStatus = 'IDLE' | 'LOADING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

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
};

export const useCrawler = (options: UseCrawlerOptions): UseCrawlerReturn => {
  const { type, pollInterval = 2000, onComplete, onError } = options;
  const [state, setState] = useState<CrawlerState>(initialState);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);

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

  // 상태 폴링
  const pollStatus = useCallback(
    async (jobId: string) => {
      if (isPollingRef.current) {
        return; // 이미 폴링 중이면 중복 방지
      }

      isPollingRef.current = true;

      try {
        const status = await getStatusApi(jobId);

        if (!status) {
          // 404 에러: 작업을 찾을 수 없음 (24시간 후 자동 삭제)
          setState((prev) => ({
            ...prev,
            status: 'FAILED',
            errorMessage: '작업을 찾을 수 없습니다. 새로 시작해주세요.',
          }));
          stop();
          return;
        }

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
        };

        setState(newState);

        // 완료 또는 실패 시 폴링 중지
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          stop();
          if (status.status === 'COMPLETED' && onComplete) {
            onComplete(newState);
          }
          if (status.status === 'FAILED' && onError) {
            onError(new Error(status.errorMessage || '작업이 실패했습니다.'));
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '상태 조회에 실패했습니다.';
        setState((prev) => ({
          ...prev,
          status: 'FAILED',
          errorMessage,
        }));
        stop();
        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage));
        }
      } finally {
        isPollingRef.current = false;
      }
    },
    [getStatusApi, onComplete, onError]
  );

  // 폴링 시작
  const startPolling = useCallback(
    (jobId: string) => {
      stop(); // 기존 폴링 중지

      // 즉시 한 번 조회
      pollStatus(jobId);

      // 주기적으로 폴링
      intervalRef.current = setInterval(() => {
        pollStatus(jobId);
      }, pollInterval);
    },
    [pollStatus, pollInterval]
  );

  // 폴링 중지
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  // 작업 시작
  const start = useCallback(
    async (params?: CollectMetadataRequest) => {
      if (state.status === 'LOADING' || state.status === 'RUNNING') {
        return; // 이미 실행 중
      }

      setState((prev) => ({ ...prev, status: 'LOADING', errorMessage: null }));

      try {
        const result = await startApi(params);
        setState((prev) => ({
          ...prev,
          status: 'RUNNING',
          jobId: result.jobId,
        }));
        startPolling(result.jobId);
      } catch (error) {
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
    [state.status, startApi, startPolling, onError]
  );

  // 재시작 (이어하기)
  const restart = useCallback(
    async (params?: CollectMetadataRequest) => {
      // 같은 API를 다시 호출하면 백엔드가 checkpoint부터 자동으로 이어서 진행
      await start(params);
    },
    [start]
  );

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
