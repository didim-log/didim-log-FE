/**
 * 루트 경로 리다이렉트 컴포넌트
 * persist 복원이 완료될 때까지 대기 후 인증 상태에 따라 리다이렉트
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Spinner } from '../components/ui/Spinner';

export const RootRedirect: React.FC = () => {
    const { isAuthenticated, token, _hasHydrated } = useAuthStore();

    // persist 복원이 완료될 때까지 로딩 표시
    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }

    // 인증된 사용자는 대시보드로, 미인증 사용자는 로그인 페이지로
    if (isAuthenticated && token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
};
