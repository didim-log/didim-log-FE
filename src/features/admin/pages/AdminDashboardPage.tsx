/**
 * 관리자 대시보드 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useAdminDashboardStats } from '../../../hooks/api/useAdmin';
import { AdminStatsChart } from '../components/AdminStatsChart';
import { UserManagement } from '../components/UserManagement';
import { QuoteManagement } from '../components/QuoteManagement';
import { FeedbackManagement } from '../components/FeedbackManagement';
import { ProblemCollector } from '../components/ProblemCollector';
import { NoticeManagement } from '../components/NoticeManagement';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { SystemSettings } from '../components/SystemSettings';
import { AdminLogManagement } from '../components/AdminLogManagement';
import { AiQualityWidget } from '../components/AiQualityWidget';
import { AiServiceControl } from '../components/AiServiceControl';
import { StorageHealthWidget } from '../components/StorageHealthWidget';
import { AdminAuditLogWidget } from '../components/AdminAuditLogWidget';
import { Spinner } from '../../../components/ui/Spinner';
import { Layout } from '../../../components/layout/Layout';

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
                                <AdminStatsChart stats={stats} />

                                {/* AI 서비스 제어 위젯 */}
                                <AiServiceControl />

                                {/* AI 품질 모니터링 위젯 */}
                                <AiQualityWidget />

                                {/* 저장 공간 관리 위젯 */}
                                <StorageHealthWidget />

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
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'quotes' && <QuoteManagement />}
                        {activeTab === 'feedbacks' && <FeedbackManagement />}
                        {activeTab === 'problems' && <ProblemCollector />}
                        {activeTab === 'notices' && <NoticeManagement />}
                        {activeTab === 'metrics' && <PerformanceMetrics />}
                        {activeTab === 'system' && <SystemSettings />}
                        {activeTab === 'logs' && <AdminLogManagement />}
                        {activeTab === 'audit' && <AdminAuditLogWidget />}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
