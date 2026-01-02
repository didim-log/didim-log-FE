/**
 * 관리자 회원 관리 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { UserManagement } from '../components/UserManagement';
import { QuoteManagement } from '../components/QuoteManagement';
import { FeedbackManagement } from '../components/FeedbackManagement';
import { ProblemCollector } from '../components/ProblemCollector';
import { NoticeManagement } from '../components/NoticeManagement';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { SystemSettings } from '../components/SystemSettings';
import { AdminLogManagement } from '../components/AdminLogManagement';
import { Layout } from '../../../components/layout/Layout';

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
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'quotes' && <QuoteManagement />}
                        {activeTab === 'feedbacks' && <FeedbackManagement />}
                        {activeTab === 'problems' && <ProblemCollector />}
                        {activeTab === 'notices' && <NoticeManagement />}
                        {activeTab === 'metrics' && <PerformanceMetrics />}
                        {activeTab === 'system' && <SystemSettings />}
                        {activeTab === 'logs' && <AdminLogManagement />}
                    </div>
                </div>
            </div>
        </Layout>
    );
};


