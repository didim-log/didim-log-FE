/**
 * 관리자 전용 라우트 컴포넌트
 */

import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Spinner } from '../components/ui/Spinner';

interface AdminRouteProps {
    children: ReactNode;
}

export const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, token, user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login', { replace: true });
            return;
        }

        if (user?.role !== 'ADMIN') {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, token, user, navigate]);

    if (!isAuthenticated || !token || user?.role !== 'ADMIN') {
        return <Spinner />;
    }

    return <>{children}</>;
};


