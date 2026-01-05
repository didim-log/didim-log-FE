/**
 * 인증 필요 라우트 컴포넌트
 */

import type { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Spinner } from '../components/ui/Spinner';

interface PrivateRouteProps {
    children: ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, token, _hasHydrated } = useAuthStore();
    const location = useLocation();

    // persist 복원 중에는 로딩 표시
    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }

    // 인증되지 않은 경우 Navigate 컴포넌트로 리다이렉트
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};
