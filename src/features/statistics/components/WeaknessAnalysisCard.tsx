/**
 * 취약점 분석 카드 컴포넌트 (백엔드 API 사용)
 * 백엔드에서 제공하는 취약점 분석 데이터를 표시
 */

import type { FC } from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useStatistics } from '../../../hooks/api/useStatistics';
import { Spinner } from '../../../components/ui/Spinner';

export const WeaknessAnalysisCard: FC = () => {
    const { data: statistics, isLoading, error } = useStatistics();
    const weaknessData = statistics?.weaknessAnalysis;

    const getFailureReasonText = (reason: string | null) => {
        switch (reason) {
            case 'TIME_OVER':
                return '시간 초과';
            case 'FAIL':
                return '오답';
            default:
                return '알 수 없음';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    취약점 분석
                </h3>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner />
                </div>
            ) : error || !weaknessData ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {error ? '데이터를 불러올 수 없습니다.' : '실패한 문제가 없습니다.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* 주요 취약점 요약 */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-3 border border-orange-200 dark:border-orange-800">
                        {weaknessData.topCategory ? (
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                <span className="text-orange-600 dark:text-orange-400">{weaknessData.topCategory}</span>
                                <span className="text-gray-600 dark:text-gray-400">에서 {weaknessData.topCategoryCount}번 실패</span>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">카테고리 정보 없음</p>
                        )}
                        {weaknessData.topReason && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                주요 원인: <strong>{getFailureReasonText(weaknessData.topReason)}</strong>
                            </p>
                        )}
                    </div>

                    {/* 통계 요약 */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">총 실패</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {weaknessData.totalFailures}회
                            </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">카테고리</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {weaknessData.categoryFailures.length}개
                            </p>
                        </div>
                    </div>

                    {/* 카테고리별 실패 분포 (스크롤 가능) */}
                    {weaknessData.categoryFailures.length > 0 && (
                        <div className="flex-1 min-h-0 flex flex-col">
                            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                카테고리별 실패 분포
                            </h4>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {weaknessData.categoryFailures.map((item) => {
                                    const maxCount = weaknessData.categoryFailures[0]?.count || 1;
                                    return (
                                        <div key={item.category} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {item.category}
                                                </span>
                                                <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">
                                                    {item.count}회
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-orange-500 dark:bg-orange-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
