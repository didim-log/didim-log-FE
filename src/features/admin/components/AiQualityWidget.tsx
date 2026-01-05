/**
 * AI 품질 모니터링 위젯
 */

import { useAiQualityStats } from '../../../hooks/api/useAdmin';
import { Spinner } from '../../../components/ui/Spinner';
import { Link } from 'react-router-dom';

export const AiQualityWidget: React.FC = () => {
    const { data: stats, isLoading, error } = useAiQualityStats();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI 품질 모니터링</h2>
                <p className="text-red-600 dark:text-red-400">데이터를 불러올 수 없습니다.</p>
            </div>
        );
    }

    const positiveRate = stats.positiveRate;
    const getColorClass = (rate: number) => {
        if (rate >= 80) return 'text-green-600 dark:text-green-400';
        if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getProgressColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">AI 품질 모니터링</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽: 긍정률 차트 */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">긍정률</h3>
                    <div className="flex items-center gap-6">
                        {/* Donut Chart (원형 프로그레스) */}
                        <div className="relative w-32 h-32">
                            <svg className="transform -rotate-90 w-32 h-32">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${(positiveRate / 100) * 352} 352`}
                                    className={getColorClass(positiveRate)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${getColorClass(positiveRate)}`}>
                                        {positiveRate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">긍정</div>
                                </div>
                            </div>
                        </div>

                        {/* 통계 정보 */}
                        <div className="flex-1">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">전체 피드백</span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {stats.totalFeedbackCount.toLocaleString()}건
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full ${getProgressColor(positiveRate)} transition-all duration-500`}
                                        style={{ width: `${positiveRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 주요 불만 사유 */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">주요 불만 사유</h3>
                    {Object.keys(stats.negativeReasons).length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">부정적 피드백이 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(stats.negativeReasons)
                                .sort(([, a], [, b]) => b - a)
                                .map(([reason, count]) => (
                                    <div
                                        key={reason}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {reason === 'INACCURATE'
                                                ? '분석 오류'
                                                : reason === 'GENERIC'
                                                  ? '내용이 뻔함'
                                                  : reason === 'NOT_HELPFUL'
                                                    ? '도움이 안 됨'
                                                    : reason}
                                        </span>
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {count}건
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 최근 부정 평가 로그 */}
            {stats.recentNegativeLogs.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">최근 부정 평가 로그</h3>
                    <div className="space-y-3">
                        {stats.recentNegativeLogs.map((log) => (
                            <Link
                                key={log.id}
                                to={`/admin/logs?logId=${log.id}`}
                                className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                                            {log.aiReview}
                                        </p>
                                        <code className="text-xs text-gray-500 dark:text-gray-400 font-mono line-clamp-2">
                                            {log.codeSnippet}
                                        </code>
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">→</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};












