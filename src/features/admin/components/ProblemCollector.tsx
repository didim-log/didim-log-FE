/**
 * 문제 크롤링 제어 컴포넌트
 * Resumable Crawling 기능 지원
 */

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useCrawler } from '../../../hooks/useCrawler';
import { useProblemStats } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { BookOpen, Minus, Maximize, Languages, RotateCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CollectMetadataRequest } from '../../../types/api/admin.types';

export const ProblemCollector: FC = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [errors, setErrors] = useState<{ start?: string; end?: string }>({});
  const [metadataParams, setMetadataParams] = useState<CollectMetadataRequest | null>(null);

  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useProblemStats();
  const suggestedStart = stats?.maxProblemId ? String(stats.maxProblemId + 1) : '';

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
    },
    onError: (error) => {
      toast.error(`상세 정보 크롤링 실패: ${error.message}`);
    },
  });

  const languageCrawler = useCrawler({
    type: 'language',
    pollInterval: 2000,
    onComplete: (state) => {
      toast.success(
        `언어 정보 업데이트 완료: ${state.successCount}개 성공, ${state.failCount}개 실패`
      );
    },
    onError: (error) => {
      toast.error(`언어 정보 업데이트 실패: ${error.message}`);
    },
  });

  // 메타데이터 수집 시작
  const handleCollectMetadata = async (e: React.FormEvent) => {
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

    if (isNaN(startNum) || isNaN(endNum) || startNum < 1 || endNum < 1 || startNum > endNum) {
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

  // 언어 정보 업데이트 시작
  const handleUpdateLanguage = async () => {
    if (
      !confirm(
        '모든 문제의 언어 정보를 업데이트하시겠습니까?\n\n' +
          '이 작업은 시간이 오래 걸릴 수 있습니다.\n' +
          '(문제 수에 따라 수 분 ~ 수십 분 소요)\n\n' +
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

  // 진행 상황 표시 컴포넌트
  const ProgressDisplay: FC<{
    state: ReturnType<typeof useCrawler>['state'];
    title: string;
    type: 'metadata' | 'details' | 'language';
  }> = ({ state, title, type }) => {
    if (state.status === 'IDLE') {
      return null;
    }

    // 현재 처리 중인 문제 ID 추정 (메타데이터 수집의 경우)
    const getCurrentProblemId = () => {
      if (type === 'metadata' && state.startProblemId && state.processedCount > 0) {
        // 시작 번호 + 처리된 개수 - 1 = 마지막 처리된 번호
        const lastProcessedId = state.startProblemId + state.processedCount - 1;
        return lastProcessedId;
      }
      return null;
    };

    const currentProblemId = getCurrentProblemId();

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

    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {title} 진행률: {state.progress}%
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {state.processedCount}/{state.totalCount}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
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
                처리 대상: descriptionHtml이 null인 문제 {state.totalCount}개
              </p>
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
                처리 대상: 언어 정보가 null이거나 "other"인 문제 {state.totalCount}개
              </p>
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
    type: 'metadata' | 'details' | 'language';
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
                언어 정보가 null이거나 "other"인 문제
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
              ) : stats?.minNullLanguageProblemId ? (
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.minNullLanguageProblemId}번부터 (null/other인 문제 최소 번호)
                </p>
              ) : (
                <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                  작업 시작 후 표시
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
          DB에 저장된 모든 문제의 언어 정보를 재판별하여 업데이트합니다. 기존 크롤링 데이터는 유지하고
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
    </div>
  );
};
