/**
 * 관리자 회원 관리 페이지
 */

import { Suspense, lazy, useState } from 'react';
import type { FC } from 'react';
import { Layout } from '../../../components/layout/Layout';

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

const AdminPanelFallback = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    </div>
);

type TabType = 'users' | 'quotes' | 'feedbacks' | 'problems' | 'notices' | 'metrics' | 'system' | 'logs';

export const AdminUsersPage: FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('users');

    const tabs = [
        { id: 'users' as TabType, label: '회원 관리' },
        { id: 'quotes' as TabType, label: '명언 관리' },
        { id: 'feedbacks' as TabType, label: '피드백 관리' },
        { id: 'problems' as TabType, label: '문제 크롤링' },
        { id: 'notices' as TabType, label: '공지 관리' },
        { id: 'metrics' as TabType, label: '성능 메트릭' },
        { id: 'system' as TabType, label: '시스템' },
        { id: 'logs' as TabType, label: 'AI 로그' },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* 헤더 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">관리자 페이지</h1>

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
                        {activeTab === 'users' && <Suspense fallback={<AdminPanelFallback />}><UserManagement /></Suspense>}
                        {activeTab === 'quotes' && <Suspense fallback={<AdminPanelFallback />}><QuoteManagement /></Suspense>}
                        {activeTab === 'feedbacks' && <Suspense fallback={<AdminPanelFallback />}><FeedbackManagement /></Suspense>}
                        {activeTab === 'problems' && <Suspense fallback={<AdminPanelFallback />}><ProblemCollector /></Suspense>}
                        {activeTab === 'notices' && <Suspense fallback={<AdminPanelFallback />}><NoticeManagement /></Suspense>}
                        {activeTab === 'metrics' && <Suspense fallback={<AdminPanelFallback />}><PerformanceMetrics /></Suspense>}
                        {activeTab === 'system' && <Suspense fallback={<AdminPanelFallback />}><SystemSettings /></Suspense>}
                        {activeTab === 'logs' && <Suspense fallback={<AdminPanelFallback />}><AdminLogManagement /></Suspense>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
