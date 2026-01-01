/**
 * 공개 라우트 컴포넌트
 */

import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Spinner } from '../components/ui/Spinner';

interface PublicRouteProps {
    children: ReactNode;
}

export const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, token, _hasHydrated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // persist 복원이 완료된 후에만 인증 체크
        if (!_hasHydrated) {
            return;
        }

        if (isAuthenticated && token) {
            const from = (location.state as { from?: string })?.from || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [_hasHydrated, isAuthenticated, token, navigate, location]);

    // persist 복원 중에는 로딩 표시
    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }

    // 인증된 사용자는 리다이렉트 (useEffect에서 처리)
    if (isAuthenticated && token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }

    return <>{children}</>;
};
