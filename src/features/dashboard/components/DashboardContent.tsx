import { useState } from 'react';
import type { FC } from 'react';
import { Menu, X } from 'lucide-react';
import type { DashboardResponse } from '../../../types/api/dashboard.types';
import type { NoticeResponse } from '../../../types/api/notice.types';
import type { ProblemCategoryMetaResponse, ProblemResponse } from '../../../types/api/problem.types';
import type { StatisticsResponse } from '../../../types/api/statistics.types';
import { NoticeWidget } from './NoticeWidget';
import { QuoteCard } from './QuoteCard';
import { RecommendedProblems } from './RecommendedProblems';
import { StatisticsPreview } from './StatisticsPreview';
import { TierProgress } from './TierProgress';
import { TodaySolvedList } from './TodaySolvedList';

export interface DashboardContentProps {
    dashboard: DashboardResponse;
    demoMode?: boolean;
    demoProblems?: readonly ProblemResponse[];
    demoCategoryMeta?: readonly ProblemCategoryMetaResponse[];
    demoStatistics?: StatisticsResponse;
    demoNotices?: readonly NoticeResponse[];
    problemPath?: (problemId: string) => string;
}

const defaultProblemPath = (problemId: string) => `/problems/${problemId}`;

export const DashboardContent: FC<DashboardContentProps> = ({
    dashboard,
    demoMode = false,
    demoProblems,
    demoCategoryMeta,
    demoStatistics,
    demoNotices,
    problemPath = defaultProblemPath,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const recommendationUser = {
        rating: dashboard.currentRating,
        tierLevel: dashboard.studentProfile.currentTierLevel,
    };

    const renderWidgets = (withSectionIds: boolean) => (
        <>
            <div id={withSectionIds ? 'notice-section' : undefined}>
                <NoticeWidget
                    dataOverride={demoMode ? demoNotices ?? [] : undefined}
                    queryEnabled={!demoMode}
                />
            </div>
            <div id={withSectionIds ? 'statistics-preview-section' : undefined}>
                <StatisticsPreview
                    dataOverride={demoMode ? demoStatistics : undefined}
                    queryEnabled={!demoMode}
                />
            </div>
            <div id={withSectionIds ? 'today-solved-section' : undefined}>
                <TodaySolvedList
                    problems={dashboard.todaySolvedProblems ?? []}
                    problemPath={problemPath}
                />
            </div>
            {dashboard.quote && (
                <div id={withSectionIds ? 'quote-section' : undefined}>
                    <QuoteCard quote={dashboard.quote} />
                </div>
            )}
        </>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-4 px-4">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-end md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Menu className="w-4 h-4" />
                        위젯
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <div id="tier-section">
                            <TierProgress dashboard={dashboard} demoMode={demoMode} />
                        </div>

                        <div id="recommend-section" className="scroll-mt-24">
                            <RecommendedProblems
                                count={4}
                                demoMode={demoMode}
                                demoProblems={demoProblems}
                                demoCategoryMeta={demoCategoryMeta}
                                userOverride={demoMode ? recommendationUser : undefined}
                                excludedProblemIds={demoMode
                                    ? dashboard.todaySolvedProblems.map((problem) => problem.problemId)
                                    : undefined}
                                problemPath={problemPath}
                                problemListPath={demoMode ? null : '/problems'}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 hidden md:block">
                        {renderWidgets(true)}
                    </div>
                </div>

                {isSidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl md:hidden overflow-y-auto">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-900 dark:text-white">위젯</p>
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="닫기"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                {renderWidgets(false)}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
