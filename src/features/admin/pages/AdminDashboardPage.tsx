/**
 * 관리자 대시보드 페이지
 */

import { Suspense, lazy, useState } from 'react';
import type { FC } from 'react';
import { useAdminDashboardStats } from '../../../hooks/api/useAdmin';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';

const AdminStatsChart = lazy(() =>
    import('../components/AdminStatsChart').then((module) => ({ default: module.AdminStatsChart }))
);
const UserManagement = lazy(() =>
    import('../components/UserManagement').then((module) => ({ default: module.UserManagement }))
);
const QuoteManagement = lazy(() =>
    import('../components/QuoteManagement').then((module) => ({ default: module.QuoteManagement }))
);
const FeedbackManagement = lazy(() =>
    import('../components/FeedbackManagement').then((module) => ({ default: module.FeedbackManagement }))
);
const ProblemCollector = lazy(() =>
    import('../components/ProblemCollector').then((module) => ({ default: module.ProblemCollector }))
);
const NoticeManagement = lazy(() =>
    import('../components/NoticeManagement').then((module) => ({ default: module.NoticeManagement }))
);
const PerformanceMetrics = lazy(() =>
    import('../components/PerformanceMetrics').then((module) => ({ default: module.PerformanceMetrics }))
);
const SystemSettings = lazy(() =>
    import('../components/SystemSettings').then((module) => ({ default: module.SystemSettings }))
);
const AdminLogManagement = lazy(() =>
    import('../components/AdminLogManagement').then((module) => ({ default: module.AdminLogManagement }))
);
const AiQualityWidget = lazy(() =>
    import('../components/AiQualityWidget').then((module) => ({ default: module.AiQualityWidget }))
);
const AiServiceControl = lazy(() =>
    import('../components/AiServiceControl').then((module) => ({ default: module.AiServiceControl }))
);
const StorageHealthWidget = lazy(() =>
    import('../components/StorageHealthWidget').then((module) => ({ default: module.StorageHealthWidget }))
);
const AdminAuditLogWidget = lazy(() =>
    import('../components/AdminAuditLogWidget').then((module) => ({ default: module.AdminAuditLogWidget }))
);

const AdminPanelFallback = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    </div>
);

type TabType = 'dashboard' | 'users' | 'quotes' | 'feedbacks' | 'problems' | 'notices' | 'metrics' | 'system' | 'logs' | 'audit';

export const AdminDashboardPage: FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const { data: stats, isLoading, error } = useAdminDashboardStats();

    const tabs = [
        { id: 'dashboard' as TabType, label: '대시보드' },
        { id: 'users' as TabType, label: '회원 관리' },
        { id: 'quotes' as TabType, label: '명언 관리' },
        { id: 'feedbacks' as TabType, label: '피드백 관리' },
        { id: 'problems' as TabType, label: '문제 크롤링' },
        { id: 'notices' as TabType, label: '공지 관리' },
        { id: 'metrics' as TabType, label: '성능 메트릭' },
        { id: 'system' as TabType, label: '시스템' },
        { id: 'logs' as TabType, label: 'AI 로그' },
        { id: 'audit' as TabType, label: '감사 로그' },
    ];

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (error || !stats) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">오류가 발생했습니다</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error instanceof Error ? error.message : '통계를 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* 헤더 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">관리자 대시보드</h1>

                        {/* 탭 */}
                        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 탭 컨텐츠 */}
                    <div>
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8">
                                {/* 통계 카드 */}
                                <Suspense fallback={<AdminPanelFallback />}>
                                    <AdminStatsChart stats={stats} />
                                </Suspense>

                                {/* AI 서비스 제어 위젯 */}
                                <Suspense fallback={<AdminPanelFallback />}>
                                    <AiServiceControl />
                                </Suspense>

                                {/* AI 품질 모니터링 위젯 */}
                                <Suspense fallback={<AdminPanelFallback />}>
                                    <AiQualityWidget />
                                </Suspense>

                                {/* 저장 공간 관리 위젯 */}
                                <Suspense fallback={<AdminPanelFallback />}>
                                    <StorageHealthWidget />
                                </Suspense>

                                {/* 통계 그래프 */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">일일 통계</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* 오늘 가입자 그래프 */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                오늘 가입한 회원
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">가입자 수</span>
                                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {stats.todaySignups}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-center"
                                                        style={{
                                                            width: `${Math.min((stats.todaySignups / Math.max(stats.totalUsers, 1)) * 100, 100)}%`,
                                                        }}
                                                    >
                                                        {stats.todaySignups > 0 && (
                                                            <span className="text-xs font-bold text-white">
                                                                {stats.todaySignups}명
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    전체 회원 대비: {((stats.todaySignups / Math.max(stats.totalUsers, 1)) * 100).toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* 오늘 작성된 회고 그래프 */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                오늘 작성된 회고
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">회고 수</span>
                                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {stats.todayRetrospectives}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-center"
                                                        style={{
                                                            width: `${Math.min((stats.todayRetrospectives / Math.max(stats.totalSolvedProblems, 1)) * 100, 100)}%`,
                                                        }}
                                                    >
                                                        {stats.todayRetrospectives > 0 && (
                                                            <span className="text-xs font-bold text-white">
                                                                {stats.todayRetrospectives}개
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    총 해결 문제 대비: {((stats.todayRetrospectives / Math.max(stats.totalSolvedProblems, 1)) * 100).toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'users' && <Suspense fallback={<AdminPanelFallback />}><UserManagement /></Suspense>}
                        {activeTab === 'quotes' && <Suspense fallback={<AdminPanelFallback />}><QuoteManagement /></Suspense>}
                        {activeTab === 'feedbacks' && <Suspense fallback={<AdminPanelFallback />}><FeedbackManagement /></Suspense>}
                        {activeTab === 'problems' && <Suspense fallback={<AdminPanelFallback />}><ProblemCollector /></Suspense>}
                        {activeTab === 'notices' && <Suspense fallback={<AdminPanelFallback />}><NoticeManagement /></Suspense>}
                        {activeTab === 'metrics' && <Suspense fallback={<AdminPanelFallback />}><PerformanceMetrics /></Suspense>}
                        {activeTab === 'system' && <Suspense fallback={<AdminPanelFallback />}><SystemSettings /></Suspense>}
                        {activeTab === 'logs' && <Suspense fallback={<AdminPanelFallback />}><AdminLogManagement /></Suspense>}
                        {activeTab === 'audit' && <Suspense fallback={<AdminPanelFallback />}><AdminAuditLogWidget /></Suspense>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
