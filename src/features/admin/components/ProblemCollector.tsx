/**
 * 문제 크롤링 제어 컴포넌트
 * Resumable Crawling 기능 지원
 */

import { useState, useMemo, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCrawler } from '../../../hooks/useCrawler';
import { useProblemStats } from '../../../hooks/api/useAdmin';
import { crawlerApi } from '../../../api/endpoints/crawler.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Minus, Maximize, Languages, RotateCw, AlertCircle, Copy, Activity, Clock3, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CollectMetadataRequest, JobStatusResponse, RefreshDetailsRequest } from '../../../types/api/admin.types';
import type { CrawlerType } from '../../../hooks/useCrawler';

type CollectorTask = {
  id: string;
  type: CrawlerType;
  title: string;
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: number | null;
  completedAt: number | null;
  processedCount: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  progressPercentage: number;
  errorMessage: string | null;
  rangeLabel: string;
  createdAt: number;
  updatedAt: number;
};

const CRAWLER_TYPE_LABEL: Record<CrawlerType, string> = {
  metadata: '메타데이터 수집',
  details: '상세 크롤링',
  detailsRefresh: '상세 재수집',
  language: '언어 재판별',
};

const JOB_TYPE_TO_CRAWLER_TYPE: Record<string, CrawlerType> = {
  METADATA: 'metadata',
  DETAILS: 'details',
  DETAILS_REFRESH: 'detailsRefresh',
  LANGUAGE_UPDATE: 'language',
};

const toCollectorTask = (job: JobStatusResponse): CollectorTask => {
  const crawlerType = JOB_TYPE_TO_CRAWLER_TYPE[job.jobType ?? ''] ?? 'details';
  const startedAtMs = job.startedAt ? job.startedAt * 1000 : null;
  const completedAtMs = job.completedAt ? job.completedAt * 1000 : null;
  const updatedAtMs = (job.lastHeartbeatAt ?? job.startedAt ?? job.queuedAt ?? 0) * 1000;
  const rangeLabel =
    job.range?.start && job.range?.end
      ? `${job.range.start}~${job.range.end}`
      : job.startProblemId && job.endProblemId
        ? `${job.startProblemId}~${job.endProblemId}`
        : '-';
  return {
    id: job.jobId,
    type: crawlerType,
    title: CRAWLER_TYPE_LABEL[crawlerType],
    jobId: job.jobId,
    status: job.status,
    startedAt: startedAtMs,
    completedAt: completedAtMs,
    processedCount: job.processedCount,
    totalCount: job.totalCount,
    successCount: job.successCount,
    failCount: job.failCount,
    progressPercentage: job.progressPercentage,
    errorMessage: job.errorMessage,
    rangeLabel,
    createdAt: (job.queuedAt ?? job.startedAt ?? 0) * 1000,
    updatedAt: updatedAtMs,
  };
};

const formatDateTime = (timestampMs?: number | null): string => {
  if (!timestampMs || Number.isNaN(timestampMs)) {
    return '-';
  }
  return new Date(timestampMs).toLocaleString('ko-KR', { hour12: false });
};

const formatDuration = (startMs?: number | null, endMs?: number | null): string => {
  if (!startMs) {
    return '-';
  }
  const end = endMs ?? Date.now();
  const diffSec = Math.max(0, Math.floor((end - startMs) / 1000));
  const minutes = Math.floor(diffSec / 60);
  const seconds = diffSec % 60;
  return `${minutes}분 ${seconds}초`;
};

export const ProblemCollector: FC = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [errors, setErrors] = useState<{ start?: string; end?: string }>({});
  const [metadataParams, setMetadataParams] = useState<CollectMetadataRequest | null>(null);
  const [refreshStart, setRefreshStart] = useState('');
  const [refreshEnd, setRefreshEnd] = useState('');
  const [refreshErrors, setRefreshErrors] = useState<{ start?: string; end?: string }>({});
  const [refreshDetailsParams, setRefreshDetailsParams] = useState<RefreshDetailsRequest | null>(null);
  const [autoRecoverEnabled, setAutoRecoverEnabled] = useState(true);
  const [autoRecoveredJobIds, setAutoRecoveredJobIds] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useProblemStats();
  const suggestedStart = stats?.maxProblemId ? String(stats.maxProblemId + 1) : '';
  const refreshStartNum = Number(refreshStart);
  const refreshEndNum = Number(refreshEnd);
  const refreshRangeValid =
    refreshStart.trim() !== '' &&
    refreshEnd.trim() !== '' &&
    Number.isInteger(refreshStartNum) &&
    Number.isInteger(refreshEndNum) &&
    refreshStartNum >= 1 &&
    refreshEndNum >= 1 &&
    refreshStartNum <= refreshEndNum;
  const refreshEstimatedCount = refreshRangeValid ? refreshEndNum - refreshStartNum + 1 : null;

  const jobsQuery = useQuery({
    queryKey: ['admin', 'problem-jobs', { page: 1, size: 40 }],
    queryFn: () => crawlerApi.getJobs({ page: 1, size: 40 }),
    refetchInterval: 5000,
  });

  const metricsDayQuery = useQuery({
    queryKey: ['admin', 'problem-jobs', 'metrics', 'DAY'],
    queryFn: () => crawlerApi.getJobMetrics('DAY'),
    refetchInterval: 30000,
  });

  const metricsWeekQuery = useQuery({
    queryKey: ['admin', 'problem-jobs', 'metrics', 'WEEK'],
    queryFn: () => crawlerApi.getJobMetrics('WEEK'),
    refetchInterval: 60000,
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'problem-jobs', 'audit', { page: 1, size: 10 }],
    queryFn: () => crawlerApi.getJobAudit({ page: 1, size: 10 }),
    refetchInterval: 30000,
  });

  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => crawlerApi.cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs'] });
      toast.success('작업 취소 요청을 보냈습니다.');
    },
  });

  const retryJobMutation = useMutation({
    mutationFn: (jobId: string) => crawlerApi.retryJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs'] });
      toast.success('작업 재시작 요청을 보냈습니다.');
    },
  });

  const taskHistory = useMemo(() => {
    const content = jobsQuery.data?.content ?? [];
    return content.map(toCollectorTask);
  }, [jobsQuery.data]);

  // 크롤링 훅들
  const metadataCrawler = useCrawler({
    type: 'metadata',
    pollInterval: 2000, // 2초마다 폴링
    onComplete: (state) => {
      toast.success(
        `메타데이터 수집 완료: ${state.successCount}개 성공, ${state.failCount}개 실패`
      );
      refetchStats();
      // 최대 ID 업데이트 후 자동으로 다음 시작 ID 설정
      if (state.endProblemId && stats?.maxProblemId && state.endProblemId > stats.maxProblemId) {
        setStart((state.endProblemId + 1).toString());
      }
      setEnd('');
      setMetadataParams(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs', 'metrics'] });
    },
    onError: (error) => {
      toast.error(`메타데이터 수집 실패: ${error.message}`);
    },
  });

  const detailsCrawler = useCrawler({
    type: 'details',
    pollInterval: 2000,
    onComplete: (state) => {
      toast.success(
        `상세 정보 크롤링 완료: ${state.successCount}개 성공, ${state.failCount}개 실패`
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs', 'metrics'] });
    },
    onError: (error) => {
      toast.error(`상세 정보 크롤링 실패: ${error.message}`);
    },
  });

  const detailsRefreshCrawler = useCrawler({
    type: 'detailsRefresh',
    pollInterval: 2000,
    onComplete: (state) => {
      toast.success(
        `상세 정보 재수집 완료: ${state.successCount}개 성공, ${state.failCount}개 실패`
      );
      refetchStats();
      setRefreshDetailsParams(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs', 'metrics'] });
    },
    onError: (error) => {
      toast.error(`상세 정보 재수집 실패: ${error.message}`);
    },
  });

  const languageCrawler = useCrawler({
    type: 'language',
    pollInterval: 2000,
    onComplete: (state) => {
      toast.success(
        `언어 정보 업데이트 완료: ${state.successCount}개 성공, ${state.failCount}개 실패`
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'problem-jobs', 'metrics'] });
    },
    onError: (error) => {
      toast.error(`언어 정보 업데이트 실패: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!autoRecoverEnabled) {
      return;
    }
    const candidates: Array<{
      state: ReturnType<typeof useCrawler>['state'];
      restart: () => Promise<void>;
      name: string;
    }> = [
      { state: metadataCrawler.state, restart: () => metadataCrawler.restart(metadataParams ?? undefined), name: '메타데이터 수집' },
      { state: detailsCrawler.state, restart: () => detailsCrawler.restart(), name: '상세 크롤링' },
      { state: detailsRefreshCrawler.state, restart: () => detailsRefreshCrawler.restart(refreshDetailsParams ?? undefined), name: '상세 재수집' },
      { state: languageCrawler.state, restart: () => languageCrawler.restart(), name: '언어 재판별' },
    ];
    candidates.forEach((candidate) => {
      const { state, restart, name } = candidate;
      if (
        state.status !== 'FAILED' ||
        !state.jobId ||
        !state.lastCheckpointId ||
        autoRecoveredJobIds[state.jobId]
      ) {
        return;
      }
      setAutoRecoveredJobIds((prev) => ({ ...prev, [state.jobId as string]: true }));
      restart()
        .then(() => toast.success(`${name} 자동 복구: checkpoint 기준 재시작했습니다.`))
        .catch(() => {
          // manual restart fallback
        });
    });
  }, [
    autoRecoverEnabled,
    autoRecoveredJobIds,
    detailsCrawler.state,
    detailsCrawler.restart,
    detailsRefreshCrawler.state,
    detailsRefreshCrawler.restart,
    languageCrawler.state,
    languageCrawler.restart,
    metadataCrawler.state,
    metadataCrawler.restart,
    metadataParams,
    refreshDetailsParams,
  ]);

  // 메타데이터 수집 시작
  const handleCollectMetadata = async (e: FormEvent) => {
    e.preventDefault();
    const resolvedStart = start || suggestedStart;
    if (!resolvedStart || !end) {
      setErrors({
        start: resolvedStart ? undefined : '시작 문제 ID를 입력해주세요.',
        end: end ? undefined : '종료 문제 ID를 입력해주세요.',
      });
      return;
    }

    const startNum = Number(resolvedStart);
    const endNum = Number(end);

    if (
      !Number.isInteger(startNum) ||
      !Number.isInteger(endNum) ||
      startNum < 1 ||
      endNum < 1 ||
      startNum > endNum
    ) {
      setErrors({ start: '유효한 범위를 입력해주세요.', end: '유효한 범위를 입력해주세요.' });
      return;
    }

    const params: CollectMetadataRequest = { start: startNum, end: endNum };
    setMetadataParams(params);

    const confirmed = window.confirm(
      `문제 ID ${startNum}부터 ${endNum}까지의 메타데이터를 수집하시겠습니까?\n\n` +
        `총 ${endNum - startNum + 1}개 문제를 수집합니다.\n` +
        `이 작업은 시간이 오래 걸릴 수 있습니다.\n\n` +
        `중단되어도 같은 범위로 다시 호출하면 이어서 진행됩니다.`
    );

    if (!confirmed) {
      setMetadataParams(null);
      return;
    }

    try {
      await metadataCrawler.start(params);
      toast.success('메타데이터 수집 작업이 시작되었습니다.');
      setErrors({});
    } catch (error) {
      setMetadataParams(null);
      if (error instanceof Error) {
        toast.error(`수집 시작 실패: ${error.message}`);
      } else {
        toast.error('수집 시작에 실패했습니다.');
      }
    }
  };

  // 메타데이터 수집 재시작 (이어하기)
  const handleRestartMetadata = async () => {
    if (!metadataParams) {
      toast.error('재시작할 작업 정보가 없습니다.');
      return;
    }

    try {
      await metadataCrawler.restart(metadataParams);
      toast.success('메타데이터 수집이 checkpoint부터 이어서 진행됩니다.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`재시작 실패: ${error.message}`);
      } else {
        toast.error('재시작에 실패했습니다.');
      }
    }
  };

  // 상세 정보 크롤링 시작
  const handleCollectDetails = async () => {
    if (
      !confirm(
        '문제 상세 정보 크롤링을 시작하시겠습니까?\n\n' +
          '시간이 오래 걸릴 수 있습니다.\n' +
          '중단되어도 다시 호출하면 이어서 진행됩니다.'
      )
    ) {
      return;
    }

    try {
      await detailsCrawler.start();
      toast.success('상세 정보 크롤링이 시작되었습니다.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`크롤링 시작 실패: ${error.message}`);
      } else {
        toast.error('크롤링 시작에 실패했습니다.');
      }
    }
  };

  // 상세 정보 강제 재수집 시작 (기존 수집 데이터 포함)
  const handleRefreshDetails = async (e: FormEvent) => {
    e.preventDefault();

    const hasStart = refreshStart.trim() !== '';
    const hasEnd = refreshEnd.trim() !== '';

    if (hasStart !== hasEnd) {
      setRefreshErrors({
        start: !hasStart ? '시작 문제 ID를 입력해주세요.' : undefined,
        end: !hasEnd ? '종료 문제 ID를 입력해주세요.' : undefined,
      });
      return;
    }

    let params: RefreshDetailsRequest | undefined;
    if (hasStart && hasEnd) {
      const startNum = Number(refreshStart);
      const endNum = Number(refreshEnd);
      if (
        !Number.isInteger(startNum) ||
        !Number.isInteger(endNum) ||
        startNum < 1 ||
        endNum < 1 ||
        startNum > endNum
      ) {
        setRefreshErrors({ start: '유효한 범위를 입력해주세요.', end: '유효한 범위를 입력해주세요.' });
        return;
      }
      params = { start: startNum, end: endNum };
    }

    const scopeMessage =
      params?.start && params?.end
        ? `문제 ID ${params.start}부터 ${params.end}까지 강제 재수집합니다.`
        : 'DB에 저장된 모든 문제를 강제 재수집합니다.';

    const confirmed = window.confirm(
      `문제 상세 정보를 강제로 재수집하시겠습니까?\n\n` +
        `${scopeMessage}\n` +
        `본문/입출력/예제와 언어 정보가 함께 최신화됩니다.\n\n` +
        `이 작업은 시간이 오래 걸릴 수 있습니다.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await detailsRefreshCrawler.start(params);
      setRefreshErrors({});
      setRefreshDetailsParams(params ?? null);
      toast.success('상세 정보 재수집 작업이 시작되었습니다.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`재수집 시작 실패: ${error.message}`);
      } else {
        toast.error('재수집 시작에 실패했습니다.');
      }
    }
  };

  const handleRestartRefreshDetails = async () => {
    try {
      await detailsRefreshCrawler.restart(refreshDetailsParams ?? undefined);
      toast.success('상세 정보 재수집 작업을 다시 시작했습니다.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`재시작 실패: ${error.message}`);
      } else {
        toast.error('재시작에 실패했습니다.');
      }
    }
  };

  // 언어 정보 업데이트 시작
  const handleUpdateLanguage = async () => {
    if (
      !confirm(
        '전체 문제의 언어를 다시 판별하시겠습니까?\n\n' +
          '이 작업은 시간이 오래 걸릴 수 있습니다.\n' +
          '(문제 수에 따라 수 분 ~ 수십 분 소요)\n\n' +
          '이번 작업은 null 값만 채우는 방식이 아니라 전체 문제를 재판별합니다.\n\n' +
          '중단되어도 다시 호출하면 이어서 진행됩니다.'
      )
    ) {
      return;
    }

    try {
      await languageCrawler.start();
      toast.success('언어 정보 업데이트 작업이 시작되었습니다.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`업데이트 시작 실패: ${error.message}`);
      } else {
        toast.error('언어 정보 업데이트 시작에 실패했습니다.');
      }
    }
  };

  const taskWarnings = useMemo(() => {
    return taskHistory
      .filter((task) => task.status === 'RUNNING' || task.status === 'FAILED')
      .map((task) => {
        const failureRate =
          task.processedCount > 0 ? Math.round((task.failCount / task.processedCount) * 100) : 0;
        const stagnantMinutes = Math.floor((Date.now() - task.updatedAt) / 60000);
        const warningMessages: string[] = [];
        if (failureRate >= 20) {
          warningMessages.push(`실패율 ${failureRate}%`);
        }
        if (task.status === 'RUNNING' && stagnantMinutes >= 3) {
          warningMessages.push(`진행 정체 ${stagnantMinutes}분`);
        }
        return {
          task,
          warningMessages,
        };
      })
      .filter((item) => item.warningMessages.length > 0)
      .slice(0, 5);
  }, [taskHistory]);

  const opsSummary = useMemo(() => {
    const dayMetrics = metricsDayQuery.data;
    const weekMetrics = metricsWeekQuery.data;
    return {
      day: {
        total: dayMetrics?.totalJobs ?? 0,
        completed: dayMetrics?.completedJobs ?? 0,
        failed: dayMetrics?.failedJobs ?? 0,
        avgDurationSec: dayMetrics?.avgDurationSeconds ?? 0,
      },
      week: {
        total: weekMetrics?.totalJobs ?? 0,
        completed: weekMetrics?.completedJobs ?? 0,
        failed: weekMetrics?.failedJobs ?? 0,
        avgDurationSec: weekMetrics?.avgDurationSeconds ?? 0,
      },
    };
  }, [metricsDayQuery.data, metricsWeekQuery.data]);

  // 진행 상황 표시 컴포넌트
  const ProgressDisplay: FC<{
    state: ReturnType<typeof useCrawler>['state'];
    title: string;
    type: 'metadata' | 'details' | 'detailsRefresh' | 'language';
  }> = ({ state, title, type }) => {
    // 그래프 데이터 준비 (시간 경과에 따른 진행률)
    const chartData = useMemo(() => {
      const history = state.progressHistory || [];
      if (history.length === 0) {
        return [];
      }

      const startTime = history[0]?.timestamp || Date.now();
      return history.map((point) => {
        const elapsedSeconds = Math.floor((point.timestamp - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        return {
          time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          progress: point.progress,
          processed: point.processedCount,
        };
      });
    }, [state.progressHistory]);

    if (state.status === 'IDLE') {
      return null;
    }

    const backendStatus = state.backendStatus ?? (state.status === 'LOADING' ? 'PENDING' : null);
    const statusLabel = backendStatus
        ? {
            PENDING: '대기 중',
            RUNNING: '실행 중',
            COMPLETED: '완료',
            FAILED: '실패',
            CANCELLED: '취소됨',
          }[backendStatus]
      : null;
    const statusClassName = backendStatus
        ? {
            PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
            RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
            COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
            CANCELLED: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          }[backendStatus]
      : '';
    const isPending = backendStatus === 'PENDING';
    const timelineSteps = [
      { key: 'PENDING', label: '대기' },
      { key: 'RUNNING', label: '실행' },
      { key: 'COMPLETED', label: '완료' },
    ] as const;
    const currentStepIndex = backendStatus === 'PENDING' ? 0 : backendStatus === 'RUNNING' ? 1 : backendStatus === 'COMPLETED' ? 2 : 1;

    const effectiveTotalCount =
      state.totalCount > 0
        ? state.totalCount
        : type === 'metadata' && state.startProblemId && state.endProblemId
          ? state.endProblemId - state.startProblemId + 1
          : 0;
    const effectiveProgress =
      effectiveTotalCount > 0
        ? Math.min(100, Math.floor((state.processedCount / effectiveTotalCount) * 100))
        : state.progress;
    const hasDeterministicProgress = effectiveTotalCount > 0;

    // 현재 처리 중인 문제 ID 추정 (메타데이터 수집의 경우)
    const currentProblemId =
      type === 'metadata' && state.startProblemId && state.processedCount > 0
        ? state.startProblemId + state.processedCount - 1
        : null;

    const speedPerMin = useMemo(() => {
      const history = state.progressHistory ?? [];
      if (history.length < 2) {
        return 0;
      }
      const first = history[0];
      const last = history[history.length - 1];
      if (!first || !last || last.timestamp <= first.timestamp) {
        return 0;
      }
      const processedDiff = Math.max(0, last.processedCount - first.processedCount);
      const elapsedMin = (last.timestamp - first.timestamp) / 60000;
      if (elapsedMin <= 0) {
        return 0;
      }
      return Math.round((processedDiff / elapsedMin) * 10) / 10;
    }, [state.progressHistory]);

    const etaConfidence = speedPerMin <= 0 ? '낮음' : speedPerMin < 5 ? '보통' : '높음';
    const etaConfidenceClass =
      etaConfidence === '높음'
        ? 'text-green-700 dark:text-green-300'
        : etaConfidence === '보통'
          ? 'text-amber-700 dark:text-amber-300'
          : 'text-gray-600 dark:text-gray-300';

    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {timelineSteps.map((step, index) => {
              const isActive = index <= currentStepIndex && backendStatus !== 'FAILED';
              return (
                <div key={step.key} className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < timelineSteps.length - 1 && (
                    <span className={`w-5 h-0.5 ${isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  )}
                </div>
              );
            })}
            {backendStatus === 'FAILED' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-600 text-white">실패</span>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {title} 진행률: {hasDeterministicProgress ? `${effectiveProgress}%` : '계산 중...'}
              </span>
              {statusLabel && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClassName}`}>
                  {statusLabel}
                </span>
              )}
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {state.processedCount}/{hasDeterministicProgress ? effectiveTotalCount : '?'}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              className={`bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ${
                hasDeterministicProgress ? '' : 'animate-pulse opacity-60'
              }`}
              style={{ width: `${hasDeterministicProgress ? effectiveProgress : 100}%` }}
            />
          </div>
        </div>

        {/* 진행률 그래프 */}
        {chartData.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
              진행률 추이
            </h4>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" className="opacity-30" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                    className="dark:stroke-gray-400"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                    className="dark:stroke-gray-400"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value: unknown) => {
                      const numValue = typeof value === 'number' ? value : undefined;
                      if (numValue === undefined) return ['0%', '진행률'];
                      return [`${numValue}%`, '진행률'];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
          {state.jobId && (
            <div className="flex items-center gap-2">
              <p className="font-medium">작업 ID: {state.jobId}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(state.jobId ?? '');
                  toast.success('작업 ID를 복사했습니다.');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <Copy className="w-3 h-3" />
                복사
              </button>
            </div>
          )}
          <p>작업 시작: {state.startedAt ? formatDateTime(state.startedAt * 1000) : '-'}</p>
          <p>마지막 갱신: {formatDateTime(state.lastUpdatedAt)}</p>
          {state.completedAt && <p>작업 완료: {formatDateTime(state.completedAt * 1000)}</p>}
          {isPending && (
            <p className="text-amber-700 dark:text-amber-300 font-medium">
              작업이 큐에서 대기 중입니다. 잠시 후 자동으로 실행 상태로 전환됩니다.
            </p>
          )}
          {/* 메타데이터 수집: 범위 및 현재 처리 번호 */}
          {type === 'metadata' && state.startProblemId && state.endProblemId && (
            <>
              <p className="font-medium">
                처리 범위: {state.startProblemId}번 ~ {state.endProblemId}번
              </p>
              {currentProblemId && (
                <p className="text-blue-700 dark:text-blue-300 font-semibold">
                  현재 처리 중: {currentProblemId}번 (마지막 처리된 번호)
                </p>
              )}
              {state.lastCheckpointId && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  마지막 checkpoint: {typeof state.lastCheckpointId === 'number' 
                    ? `${state.lastCheckpointId}번` 
                    : state.lastCheckpointId}
                </p>
              )}
              {state.startProblemId && (
                <p>시작 번호: {state.startProblemId}번부터</p>
              )}
            </>
          )}
          {/* 상세 정보 크롤링: 처리된 개수 기반 정보 */}
          {type === 'details' && (
            <>
              <p className="font-medium">
                처리 대상: descriptionHtml이 null인 문제 {hasDeterministicProgress ? effectiveTotalCount : '집계 중'}개
              </p>
              {isPending && (
                <p>
                  현재 상태: 대상 문제를 집계하고 작업 리소스를 할당하는 중입니다.
                </p>
              )}
              {state.processedCount > 0 && (
                <p className="text-blue-700 dark:text-blue-300 font-semibold">
                  처리 완료: {state.processedCount}개
                </p>
              )}
            </>
          )}
          {/* 상세 정보 강제 재수집: 처리된 개수 기반 정보 */}
          {type === 'detailsRefresh' && (
            <>
              <p className="font-medium">
                처리 대상: 기존 수집 여부와 무관하게 선택한 문제 상세/언어 정보를 강제 갱신
              </p>
              {isPending && (
                <p>
                  현재 상태: 재수집 대상 준비 중입니다.
                </p>
              )}
              {state.processedCount > 0 && (
                <p className="text-blue-700 dark:text-blue-300 font-semibold">
                  처리 완료: {state.processedCount}개
                </p>
              )}
            </>
          )}
          {/* 언어 정보 업데이트: 처리된 개수 기반 정보 */}
          {type === 'language' && (
            <>
              <p className="font-medium">
                처리 대상: 전체 문제 언어 재판별 {hasDeterministicProgress ? effectiveTotalCount : '집계 중'}개
              </p>
              {isPending && (
                <p>
                  현재 상태: 재판별 대상 준비 중입니다.
                </p>
              )}
              {state.processedCount > 0 && (
                <p className="text-blue-700 dark:text-blue-300 font-semibold">
                  처리 완료: {state.processedCount}개
                </p>
              )}
            </>
          )}
          <p>
            성공: {state.successCount}개 | 실패: {state.failCount}개
          </p>
          {state.estimatedRemainingSeconds && (
            <p>
              예상 남은 시간: 약 {Math.floor(state.estimatedRemainingSeconds / 60)}분
            </p>
          )}
          <p>
            처리 속도: {speedPerMin > 0 ? `${speedPerMin}건/분` : '집계 중'} | ETA 신뢰도:{' '}
            <span className={etaConfidenceClass}>{etaConfidence}</span>
          </p>
          {state.retryCount > 0 && (
            <p className="text-amber-700 dark:text-amber-300">
              네트워크 재시도 횟수: {state.retryCount}회
            </p>
          )}
          <p className="mt-2 text-blue-700 dark:text-blue-300 font-medium">
            이 작업은 시간이 오래 걸릴 수 있습니다. 페이지를 닫지 마세요.
          </p>
        </div>
      </div>
    );
  };

  // 에러 표시 및 재시작 버튼 컴포넌트
  const ErrorDisplay: FC<{
    state: ReturnType<typeof useCrawler>['state'];
    onRestart: () => void;
    title: string;
  }> = ({ state, onRestart, title }) => {
    if (state.status !== 'FAILED') {
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
              {title} 실패
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
              {state.errorMessage || '알 수 없는 오류가 발생했습니다.'}
            </p>
            {state.lastCheckpointId && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                마지막 처리 위치: {typeof state.lastCheckpointId === 'number' 
                  ? `${state.lastCheckpointId}번` 
                  : state.lastCheckpointId}
              </p>
            )}
            <Button
              onClick={onRestart}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              {state.lastCheckpointId 
                ? `재시작 (${typeof state.lastCheckpointId === 'number' ? state.lastCheckpointId + 1 : 'checkpoint'}번부터)`
                : '이어서 재시작'}
            </Button>
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {state.lastCheckpointId 
                ? 'checkpoint부터 자동으로 이어서 진행됩니다.'
                : '같은 범위로 다시 호출하면 checkpoint부터 자동으로 이어서 진행됩니다.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 완료 표시 컴포넌트
  const CompleteDisplay: FC<{
    state: ReturnType<typeof useCrawler>['state'];
    title: string;
    type: 'metadata' | 'details' | 'detailsRefresh' | 'language';
  }> = ({ state, title, type }) => {
    if (state.status !== 'COMPLETED') {
      return null;
    }

    // 마지막 처리된 문제 ID (메타데이터 수집의 경우)
    const getLastProcessedId = () => {
      if (type === 'metadata' && state.endProblemId) {
        return state.endProblemId;
      }
      return null;
    };

    const lastProcessedId = getLastProcessedId();

    return (
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
          ✅ {title} 완료: {state.successCount}개 성공, {state.failCount}개 실패
        </p>
        {lastProcessedId && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            마지막 처리된 번호: {lastProcessedId}번
          </p>
        )}
        {type !== 'metadata' && state.processedCount > 0 && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            총 {state.processedCount}개 처리 완료
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 문제 통계 대시보드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 수집 현황</h2>
        {isStatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">수집된 문제 수</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalCount.toLocaleString() ?? 0}개
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Minus className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">최소 문제 ID</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.minProblemId ? `${stats.minProblemId}번` : '-'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">제일 빠른 문제 번호</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Maximize className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">최대 문제 ID</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.maxProblemId ? `${stats.maxProblemId}번` : '-'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">제일 느린 문제 번호</p>
            </div>
          </div>
        )}
      </div>

      {/* 운영 리포트 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            24시간 작업 리포트
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">총 작업</p>
              <p className="font-semibold text-gray-900 dark:text-white">{opsSummary.day.total}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">평균 소요</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {Math.floor(opsSummary.day.avgDurationSec / 60)}분 {opsSummary.day.avgDurationSec % 60}초
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">완료</p>
              <p className="font-semibold text-green-700 dark:text-green-300">{opsSummary.day.completed}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">실패</p>
              <p className="font-semibold text-red-700 dark:text-red-300">{opsSummary.day.failed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            7일 작업 리포트
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">총 작업</p>
              <p className="font-semibold text-gray-900 dark:text-white">{opsSummary.week.total}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">평균 소요</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {Math.floor(opsSummary.week.avgDurationSec / 60)}분 {opsSummary.week.avgDurationSec % 60}초
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">완료</p>
              <p className="font-semibold text-green-700 dark:text-green-300">{opsSummary.week.completed}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">실패</p>
              <p className="font-semibold text-red-700 dark:text-red-300">{opsSummary.week.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 운영 경고 */}
      {taskWarnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-md p-5 border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            운영 경고
          </h3>
          <div className="space-y-2">
            {taskWarnings.map(({ task, warningMessages }) => (
              <p key={task.jobId} className="text-sm text-amber-800 dark:text-amber-200">
                [{task.title}] {warningMessages.join(', ')} (jobId: {task.jobId})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 자동 복구 옵션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
        <label className="inline-flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={autoRecoverEnabled}
            onChange={(e) => setAutoRecoverEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          checkpoint가 있는 실패 작업은 1회 자동 복구(재시작)
        </label>
      </div>

      {/* 메타데이터 수집 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 메타데이터 수집</h2>
        
        {/* 크롤링 정보 카드 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">마지막 크롤링된 번호</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.maxProblemId ? `${stats.maxProblemId}번` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">다음 시작 번호 (권장)</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {suggestedStart ? `${suggestedStart}번` : '-'}
              </p>
            </div>
          </div>
          {metadataCrawler.state.status === 'RUNNING' && metadataCrawler.state.startProblemId && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 작업 시작 번호</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {metadataCrawler.state.startProblemId}번부터 시작
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleCollectMetadata} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="시작 문제 ID"
              type="number"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setErrors((prev) => ({ ...prev, start: undefined }));
              }}
              placeholder={suggestedStart || '예: 1000'}
              min={1}
              required
              error={errors.start}
            />
            <Input
              label="종료 문제 ID"
              type="number"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setErrors((prev) => ({ ...prev, end: undefined }));
              }}
              placeholder="예: 1100"
              min={1}
              required
              error={errors.end}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={metadataCrawler.isLoading}
            disabled={metadataCrawler.state.status === 'RUNNING'}
          >
            {metadataCrawler.isLoading
              ? '작업 시작 중...'
              : metadataCrawler.state.status === 'RUNNING'
                ? '작업 진행 중...'
                : '메타데이터 수집 시작'}
          </Button>
        </form>

        <ProgressDisplay
          state={metadataCrawler.state}
          title="메타데이터 수집"
          type="metadata"
        />
        <ErrorDisplay
          state={metadataCrawler.state}
          onRestart={handleRestartMetadata}
          title="메타데이터 수집"
        />
        <CompleteDisplay
          state={metadataCrawler.state}
          title="메타데이터 수집"
          type="metadata"
        />
      </div>

      {/* 상세 정보 크롤링 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 상세 정보 크롤링</h2>
        
        {/* 크롤링 정보 카드 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">처리 대상</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                descriptionHtml이 null인 문제
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">시작 번호</p>
              {detailsCrawler.state.status === 'RUNNING' && detailsCrawler.state.startProblemId ? (
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {detailsCrawler.state.startProblemId}번부터
                </p>
              ) : detailsCrawler.state.status === 'COMPLETED' ? (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  완료됨
                </p>
              ) : stats?.minNullDescriptionHtmlProblemId ? (
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.minNullDescriptionHtmlProblemId}번부터 (null인 문제 최소 번호)
                </p>
              ) : (
                <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                  작업 시작 후 표시
                </p>
              )}
            </div>
          </div>
          {detailsCrawler.state.status === 'RUNNING' && detailsCrawler.state.processedCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 진행 상황</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {detailsCrawler.state.processedCount}개 처리 완료
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          DB에서 descriptionHtml이 null인 문제들의 상세 정보를 백준 사이트에서 크롤링하여 업데이트합니다.
          <br />
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
            중단되어도 다시 호출하면 checkpoint부터 자동으로 이어서 진행됩니다.
          </span>
        </p>
        <Button
          onClick={handleCollectDetails}
          variant="primary"
          isLoading={detailsCrawler.isLoading}
          disabled={detailsCrawler.state.status === 'RUNNING'}
        >
          {detailsCrawler.isLoading
            ? '작업 시작 중...'
            : detailsCrawler.state.status === 'RUNNING'
              ? '작업 진행 중...'
              : '상세 정보 크롤링 시작'}
        </Button>

        <ProgressDisplay
          state={detailsCrawler.state}
          title="상세 정보 크롤링"
          type="details"
        />
        <ErrorDisplay
          state={detailsCrawler.state}
          onRestart={() => detailsCrawler.restart()}
          title="상세 정보 크롤링"
        />
        <CompleteDisplay
          state={detailsCrawler.state}
          title="상세 정보 크롤링"
          type="details"
        />
      </div>

      {/* 상세 정보 강제 재수집 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          문제 상세 정보 강제 재수집
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          기존에 수집된 문제도 포함하여 상세 정보(description/input/output/sample)와 언어 정보를 다시
          크롤링해 최신화합니다. 범위를 비워두면 전체 문제를 대상으로 실행됩니다.
        </p>

        <form onSubmit={handleRefreshDetails} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="시작 문제 ID (선택)"
              type="number"
              value={refreshStart}
              onChange={(e) => {
                setRefreshStart(e.target.value);
                setRefreshErrors((prev) => ({ ...prev, start: undefined }));
              }}
              placeholder="예: 1000"
              min={1}
              error={refreshErrors.start}
            />
            <Input
              label="종료 문제 ID (선택)"
              type="number"
              value={refreshEnd}
              onChange={(e) => {
                setRefreshEnd(e.target.value);
                setRefreshErrors((prev) => ({ ...prev, end: undefined }));
              }}
              placeholder="예: 5000"
              min={1}
              error={refreshErrors.end}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            범위를 지정하려면 시작/종료를 모두 입력해야 하며, 비워두면 전체 재수집을 수행합니다.
          </p>
          {refreshEstimatedCount !== null && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              예상 처리 대상: 약 {refreshEstimatedCount.toLocaleString()}개
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={detailsRefreshCrawler.isLoading}
            disabled={detailsRefreshCrawler.state.status === 'RUNNING'}
          >
            {detailsRefreshCrawler.isLoading
              ? '작업 시작 중...'
              : detailsRefreshCrawler.state.status === 'RUNNING'
                ? '작업 진행 중...'
                : '상세 정보 강제 재수집 시작'}
          </Button>
        </form>

        <ProgressDisplay
          state={detailsRefreshCrawler.state}
          title="상세 정보 재수집"
          type="detailsRefresh"
        />
        <ErrorDisplay
          state={detailsRefreshCrawler.state}
          onRestart={handleRestartRefreshDetails}
          title="상세 정보 재수집"
        />
        <CompleteDisplay
          state={detailsRefreshCrawler.state}
          title="상세 정보 재수집"
          type="detailsRefresh"
        />
      </div>

      {/* 언어 정보 최신화 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          문제 언어 정보 최신화
        </h2>
        
        {/* 크롤링 정보 카드 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">처리 대상</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                전체 문제 언어 재판별
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">시작 번호</p>
              {languageCrawler.state.status === 'RUNNING' && languageCrawler.state.startProblemId ? (
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {languageCrawler.state.startProblemId}번부터
                </p>
              ) : languageCrawler.state.status === 'COMPLETED' ? (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  완료됨
                </p>
              ) : (
                <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                  전체 범위 대상
                </p>
              )}
            </div>
          </div>
          {languageCrawler.state.status === 'RUNNING' && languageCrawler.state.processedCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 진행 상황</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {languageCrawler.state.processedCount}개 처리 완료
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          DB에 저장된 전체 문제를 대상으로 본문/입출력/제목 기반 언어 판별을 다시 수행합니다. 기존 크롤링 데이터는 유지하고
          language 필드만 업데이트합니다.
          <br />
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
            (소요 시간: 문제 수에 따라 수 분 ~ 수십 분)
            <br />
            중단되어도 다시 호출하면 checkpoint부터 자동으로 이어서 진행됩니다.
          </span>
        </p>
        <Button
          onClick={handleUpdateLanguage}
          variant="primary"
          isLoading={languageCrawler.isLoading}
          disabled={languageCrawler.state.status === 'RUNNING'}
          className="flex items-center gap-2"
        >
          {languageCrawler.isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              작업 시작 중...
            </>
          ) : languageCrawler.state.status === 'RUNNING' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              작업 진행 중...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              언어 정보 최신화 시작
            </>
          )}
        </Button>

        <ProgressDisplay
          state={languageCrawler.state}
          title="언어 정보 업데이트"
          type="language"
        />
        <ErrorDisplay
          state={languageCrawler.state}
          onRestart={() => languageCrawler.restart()}
          title="언어 정보 업데이트"
        />
        <CompleteDisplay
          state={languageCrawler.state}
          title="언어 정보 업데이트"
          type="language"
        />
      </div>

      {/* 최근 작업 이력 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">최근 작업 이력</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              jobsQuery.refetch();
              auditQuery.refetch();
            }}
          >
            새로고침
          </Button>
        </div>
        {taskHistory.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">아직 기록된 작업이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-3">작업</th>
                  <th className="py-2 pr-3">상태</th>
                  <th className="py-2 pr-3">진행</th>
                  <th className="py-2 pr-3">범위</th>
                  <th className="py-2 pr-3">소요</th>
                  <th className="py-2 pr-3">업데이트</th>
                  <th className="py-2 pr-3">제어</th>
                  <th className="py-2">jobId</th>
                </tr>
              </thead>
              <tbody>
                {taskHistory.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                    <td className="py-2 pr-3">{task.title}</td>
                    <td className="py-2 pr-3">{task.status}</td>
                    <td className="py-2 pr-3">
                      {task.processedCount}/{task.totalCount || '?'} ({task.progressPercentage}%)
                    </td>
                    <td className="py-2 pr-3">{task.rangeLabel}</td>
                    <td className="py-2 pr-3">{formatDuration(task.startedAt, task.completedAt)}</td>
                    <td className="py-2 pr-3">{formatDateTime(task.updatedAt)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1">
                        {(task.status === 'PENDING' || task.status === 'RUNNING') && (
                          <button
                            type="button"
                            onClick={() => cancelJobMutation.mutate(task.jobId)}
                            className="px-2 py-1 rounded border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            취소
                          </button>
                        )}
                        {(task.status === 'FAILED' || task.status === 'CANCELLED') && (
                          <button
                            type="button"
                            onClick={() => retryJobMutation.mutate(task.jobId)}
                            className="px-2 py-1 rounded border border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            재시도
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(task.jobId);
                          toast.success('jobId를 복사했습니다.');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Copy className="w-3 h-3" />
                        복사
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 최근 감사 로그 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">최근 배치 감사 로그</h2>
        {auditQuery.data?.content?.length ? (
          <div className="space-y-2 text-sm">
            {auditQuery.data.content.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                [{item.jobType}] {item.status} | admin: {item.adminId} | range:{' '}
                {item.rangeStart && item.rangeEnd ? `${item.rangeStart}~${item.rangeEnd}` : '-'} |{' '}
                {new Date(item.createdAt).toLocaleString('ko-KR', { hour12: false })}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">감사 로그 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
};
