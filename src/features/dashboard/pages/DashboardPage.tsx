/**
 * 대시보드 페이지
 */

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { useDashboard } from '../../../hooks/api/useDashboard';
import { NoticeWidget } from '../components/NoticeWidget';
import { TierProgress } from '../components/TierProgress';
import { RecommendedProblems } from '../components/RecommendedProblems';
import { TodaySolvedList } from '../components/TodaySolvedList';
import { StatisticsPreview } from '../components/StatisticsPreview';
import { QuoteCard } from '../components/QuoteCard';
import { Spinner } from '../../../components/ui/Spinner';
import { useAuthStore } from '../../../stores/auth.store';
import { Layout } from '../../../components/layout/Layout';
import { useSyncBojProfile } from '../../../hooks/api/useStudent';
import { Menu, X } from 'lucide-react';

const LAST_SYNC_KEY = 'boj_last_sync_time';
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1시간

export const DashboardPage: FC = () => {
    const { data: dashboard, isLoading, error } = useDashboard();
    const { setUser, user } = useAuthStore();
    const syncMutation = useSyncBojProfile();
    const hasAutoSynced = useRef(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 대시보드 데이터를 받아올 때 primaryLanguage를 전역 상태에 업데이트
    useEffect(() => {
        if (
            dashboard?.studentProfile?.primaryLanguage !== undefined &&
            user &&
            user.primaryLanguage !== dashboard.studentProfile.primaryLanguage
        ) {
            setUser({
                ...user,
                primaryLanguage: dashboard.studentProfile.primaryLanguage,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboard?.studentProfile?.primaryLanguage]);

    // 자동 동기화: 마지막 동기화 시간이 1시간 이상 지났으면 자동으로 동기화
    useEffect(() => {
        if (isLoading || error || !dashboard || hasAutoSynced.current) {
            return;
        }

        const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
        const now = Date.now();

        if (!lastSyncTime || now - parseInt(lastSyncTime, 10) > SYNC_INTERVAL_MS) {
            hasAutoSynced.current = true;
            syncMutation.mutate(undefined, {
                onSuccess: () => {
                    localStorage.setItem(LAST_SYNC_KEY, now.toString());
                },
                onError: () => {
                    // 자동 동기화 실패는 조용히 처리 (사용자에게 알리지 않음)
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, error, dashboard]);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '대시보드를 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!dashboard) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-600 dark:text-gray-400">데이터를 불러올 수 없습니다.</p>
                </div>
            </Layout>
        );
    }

    // 데이터 안전장치: dashboard의 필수 필드가 있는지 확인
    if (!dashboard.studentProfile) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">대시보드 데이터 형식이 올바르지 않습니다.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-gray-50 dark:bg-gray-900 py-4 px-4">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* 모바일: 우측 위젯(사이드바) Drawer 토글 */}
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

                    {/* 메인 컨텐츠 그리드 - 2:1 비율 레이아웃 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* 좌측 컬럼 (메인 콘텐츠) - lg:col-span-2 */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* 프로필 카드 */}
                            <div id="tier-section">
                                <TierProgress dashboard={dashboard} />
                            </div>

                            {/* 추천 문제 */}
                            <div id="recommend-section">
                                <RecommendedProblems count={4} />
                            </div>
                        </div>

                        {/* 우측 컬럼 (사이드바) - lg:col-span-1 */}
                        <div className="space-y-4 hidden md:block">
                            {/* 공지사항 위젯 */}
                            <div id="notice-section">
                                <NoticeWidget />
                            </div>

                            {/* 통계 미리보기 */}
                            <div id="statistics-preview-section">
                                <StatisticsPreview />
                            </div>

                            {/* 오늘 푼 문제 */}
                            <div id="today-solved-section">
                                <TodaySolvedList
                                    problems={dashboard.todaySolvedProblems ?? []}
                                />
                            </div>

                            {/* 명언 카드 */}
                            {dashboard.quote && (
                                <div id="quote-section">
                                    <QuoteCard quote={dashboard.quote} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 모바일 사이드바 Drawer */}
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
                                    <NoticeWidget />
                                    <StatisticsPreview />
                                    <TodaySolvedList problems={dashboard.todaySolvedProblems ?? []} />
                                    {dashboard.quote && <QuoteCard quote={dashboard.quote} />}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};
