/**
 * 대시보드 페이지
 */

import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useDashboard } from '../../../hooks/api/useDashboard';
import { Spinner } from '../../../components/ui/Spinner';
import { useAuthStore } from '../../../stores/auth.store';
import { Layout } from '../../../components/layout/Layout';
import { useSyncBojProfile } from '../../../hooks/api/useStudent';
import { DashboardContent } from '../components/DashboardContent';

const LAST_SYNC_KEY = 'boj_last_sync_time';
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1시간

export const DashboardPage: FC = () => {
    const { data: dashboard, isLoading, error } = useDashboard();
    const { setUser, user } = useAuthStore();
    const syncMutation = useSyncBojProfile();
    const hasAutoSynced = useRef(false);

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
            <DashboardContent dashboard={dashboard} />
        </Layout>
    );
};
