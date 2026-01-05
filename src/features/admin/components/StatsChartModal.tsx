/**
 * 통계 카드 클릭 시 표시되는 트렌드 차트 모달
 */

import { useState } from 'react';
import type { FC } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminDashboardChart } from '../../../hooks/api/useAdmin';
import { Spinner } from '../../../components/ui/Spinner';
import type { ChartDataType, ChartPeriod } from '../../../types/api/admin.types';
import { useBodyScrollLock } from '@/hooks/ui/useBodyScrollLock';

interface StatsChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataType: ChartDataType;
    title: string;
}

export const StatsChartModal: FC<StatsChartModalProps> = ({ isOpen, onClose, dataType, title }) => {
    const [period, setPeriod] = useState<ChartPeriod>('DAILY');
    const { data, isLoading, error } = useAdminDashboardChart(dataType, period);

    useBodyScrollLock({ locked: isOpen });

    if (!isOpen) {
        return null;
    }

    const chartData = data?.data || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* 탭 */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {(['DAILY', 'WEEKLY', 'MONTHLY'] as ChartPeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-3 font-medium text-sm transition-colors ${
                                period === p
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            {p === 'DAILY' ? '일별' : p === 'WEEKLY' ? '주별' : '월별'}
                        </button>
                    ))}
                </div>

                {/* 차트 */}
                <div className="flex-1 p-6 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <p className="text-red-600 dark:text-red-400">
                                    {error instanceof Error ? error.message : '차트 데이터를 불러올 수 없습니다.'}
                                </p>
                            </div>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <p className="text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    className="dark:stroke-gray-400"
                                    tick={{ fill: '#6b7280' }}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    className="dark:stroke-gray-400"
                                    tick={{ fill: '#6b7280' }}
                                    style={{ fontSize: '12px' }}
                                />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="값"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

