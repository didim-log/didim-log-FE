/**
 * 관리자 성능 메트릭 컴포넌트
 */

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAdminDashboardMetrics } from '../../../hooks/api/useAdmin';
import { Spinner } from '../../../components/ui/Spinner';
import { formatKST } from '../../../utils/dateUtils';

const RPM_THRESHOLD = 100; // RPM 위험 임계값
const LATENCY_THRESHOLD = 500; // 응답 시간 위험 임계값 (ms)
const P95_LATENCY_THRESHOLD = 1000; // P95 위험 임계값 (ms)
const ERROR_RATE_THRESHOLD = 2; // 에러율 위험 임계값 (%)
const EMPTY_TIME_SERIES: ReadonlyArray<{ timestamp: number; value: number }> = [];

export const PerformanceMetrics: FC = () => {
    const [minutes, setMinutes] = useState<number>(30);
    const { data, isLoading, error } = useAdminDashboardMetrics(minutes);
    const rpmTimeSeries = data?.rpmTimeSeries ?? EMPTY_TIME_SERIES;
    const latencyTimeSeries = data?.latencyTimeSeries ?? EMPTY_TIME_SERIES;
    const errorRateTimeSeries = data?.errorRateTimeSeries ?? EMPTY_TIME_SERIES;

    // Time Series 데이터 포맷팅
    const rpmChartData = useMemo(() => {
        if (rpmTimeSeries.length === 0) {
            return [];
        }
        return rpmTimeSeries.map((point) => ({
            time: formatKST(new Date(point.timestamp * 1000).toISOString(), 'timeOnly'),
            rpm: point.value,
            isOverThreshold: point.value > RPM_THRESHOLD,
        }));
    }, [rpmTimeSeries]);

    const latencyChartData = useMemo(() => {
        if (latencyTimeSeries.length === 0) {
            return [];
        }
        return latencyTimeSeries.map((point) => ({
            time: formatKST(new Date(point.timestamp * 1000).toISOString(), 'timeOnly'),
            latency: point.value,
            isOverThreshold: point.value > LATENCY_THRESHOLD,
        }));
    }, [latencyTimeSeries]);

    const errorRateChartData = useMemo(() => {
        if (errorRateTimeSeries.length === 0) {
            return [];
        }
        return errorRateTimeSeries.map((point) => ({
            time: formatKST(new Date(point.timestamp * 1000).toISOString(), 'timeOnly'),
            errorRate: point.value,
            isOverThreshold: point.value > ERROR_RATE_THRESHOLD,
        }));
    }, [errorRateTimeSeries]);

    if (isLoading) {
        return <Spinner />;
    }

    if (error || !data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '성능 메트릭을 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    const currentRpm = data.rpm;
    const currentLatency = data.averageResponseTime;
    const currentP95Latency = data.p95ResponseTime;
    const currentErrorRate = data.errorRate;
    const isRpmOverThreshold = currentRpm > RPM_THRESHOLD;
    const isLatencyOverThreshold = currentLatency > LATENCY_THRESHOLD;
    const isP95OverThreshold = currentP95Latency > P95_LATENCY_THRESHOLD;
    const isErrorRateOverThreshold = currentErrorRate > ERROR_RATE_THRESHOLD;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">성능 메트릭</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            최근 {data.timeRangeMinutes}분 기준 RPM/평균 응답 시간
                        </p>
                    </div>
                    <select
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={30}>30분</option>
                        <option value={60}>60분</option>
                    </select>
                </div>
            </div>

            {/* 현재 값 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border ${
                    isRpmOverThreshold 
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">RPM</p>
                        {isRpmOverThreshold && (
                            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                                위험
                            </span>
                        )}
                    </div>
                    <p className={`mt-2 text-3xl font-bold ${
                        isRpmOverThreshold 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {currentRpm.toFixed(1)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        임계값: {RPM_THRESHOLD} RPM
                    </p>
                </div>
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border ${
                    isLatencyOverThreshold 
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">평균 응답 시간 (ms)</p>
                        {isLatencyOverThreshold && (
                            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                                위험
                            </span>
                        )}
                    </div>
                    <p className={`mt-2 text-3xl font-bold ${
                        isLatencyOverThreshold 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {currentLatency.toFixed(1)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        임계값: {LATENCY_THRESHOLD}ms
                    </p>
                </div>
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border ${
                    isP95OverThreshold
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">P95 응답 시간 (ms)</p>
                        {isP95OverThreshold && (
                            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                                위험
                            </span>
                        )}
                    </div>
                    <p className={`mt-2 text-3xl font-bold ${
                        isP95OverThreshold
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {currentP95Latency.toFixed(1)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        임계값: {P95_LATENCY_THRESHOLD}ms
                    </p>
                </div>
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border ${
                    isErrorRateOverThreshold
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">에러율 (%)</p>
                        {isErrorRateOverThreshold && (
                            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                                위험
                            </span>
                        )}
                    </div>
                    <p className={`mt-2 text-3xl font-bold ${
                        isErrorRateOverThreshold
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {currentErrorRate.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        임계값: {ERROR_RATE_THRESHOLD}%
                    </p>
                </div>
            </div>

            {/* 운영 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 요청 수</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.totalRequests.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">에러 요청 수 (4xx/5xx)</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.errorRequests.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">서버 에러율 (5xx)</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.serverErrorRate.toFixed(2)}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">슬로우 요청 비율 (≥1s)</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.slowRequestRate.toFixed(2)}%</p>
                </div>
            </div>

            {/* 상태 코드 분포 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">상태 코드 분포 (상위 6개)</h3>
                {data.statusCodeSummary.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {data.statusCodeSummary.map((summary) => (
                            <div
                                key={summary.statusCode}
                                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
                            >
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{summary.statusCode}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {summary.count.toLocaleString()}건 · {summary.ratio.toFixed(2)}%
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RPM 차트 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">RPM 추이</h3>
                {rpmChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={rpmChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="time"
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
                            <ReferenceLine
                                y={RPM_THRESHOLD}
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                label={{ value: `임계값 (${RPM_THRESHOLD})`, position: 'right' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rpm"
                                stroke={isRpmOverThreshold ? '#ef4444' : '#3b82f6'}
                                strokeWidth={2}
                                dot={{ r: 4, fill: isRpmOverThreshold ? '#ef4444' : '#3b82f6' }}
                                activeDot={{ r: 6 }}
                                name="RPM"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Latency 차트 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">응답 시간 추이</h3>
                {latencyChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={latencyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="time"
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
                            <ReferenceLine
                                y={LATENCY_THRESHOLD}
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                label={{ value: `임계값 (${LATENCY_THRESHOLD}ms)`, position: 'right' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="latency"
                                stroke={isLatencyOverThreshold ? '#ef4444' : '#10b981'}
                                strokeWidth={2}
                                dot={{ r: 4, fill: isLatencyOverThreshold ? '#ef4444' : '#10b981' }}
                                activeDot={{ r: 6 }}
                                name="응답 시간 (ms)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Error Rate 차트 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">에러율 추이</h3>
                {errorRateChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={errorRateChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="time"
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
                            <ReferenceLine
                                y={ERROR_RATE_THRESHOLD}
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                label={{ value: `임계값 (${ERROR_RATE_THRESHOLD}%)`, position: 'right' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="errorRate"
                                stroke={isErrorRateOverThreshold ? '#ef4444' : '#f59e0b'}
                                strokeWidth={2}
                                dot={{ r: 4, fill: isErrorRateOverThreshold ? '#ef4444' : '#f59e0b' }}
                                activeDot={{ r: 6 }}
                                name="에러율 (%)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
