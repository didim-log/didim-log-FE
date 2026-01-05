/**
 * 회원가입 페이지 (3단계 위저드)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignupWizard } from '../components/SignupWizard';
import { authApi } from '../../../api/endpoints/auth.api';
import { useOnboardingStore } from '../../../stores/onboarding.store';
import { useAuthStore } from '../../../stores/auth.store';
import { toast } from 'sonner';
import { isApiError } from '../../../types/api/common.types';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { toastApiError } from '../../../utils/toastApiError';
import { parseOAuthSignupState } from '../../../types/auth/oauth.types';
import { SignupFinalizePage } from './SignupFinalizePage';

export const SignupPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsNewUser } = useOnboardingStore();
    const { setToken, setUser } = useAuthStore();
    const [apiError, setApiError] = useState<{
        message: string;
        code?: string;
        status?: number;
        fieldErrors?: Record<string, string[]>;
    } | null>(null);

    const handleComplete = async (data: { bojId: string; email: string; password: string }) => {
        setApiError(null); // 새 시도 시 에러 초기화

        try {
            setIsNewUser(true);
            const response = await authApi.signup(data);
            
            // 토큰 저장
            setToken(response.token);

            // 사용자 정보 저장 (토큰에서 추출)
            const { decodeJwt } = await import('../../../utils/jwt');
            const payload = decodeJwt(response.token);
            const user = {
                id: payload?.sub || '',
                nickname: '',
                bojId: payload?.sub || '',
                email: null,
                role: (payload?.role as 'USER' | 'ADMIN' | 'GUEST') || 'USER',
                rating: response.rating,
                tier: response.tier,
                tierLevel: response.tierLevel,
                provider: 'BOJ' as const,
            };
            setUser(user);

            toast.success('회원가입이 완료되었습니다!');
            navigate('/dashboard', { replace: true });
        } catch (error: unknown) {
            const errorCode = isApiError(error) ? error.response?.data?.code : undefined;
            const errorStatus = isApiError(error) ? error.response?.status : undefined;

            if (errorStatus === 409 && errorCode === 'DUPLICATE_BOJ_ID') {
                // 이미 가입된 BOJ ID - SignupWizard에서 2단계로 돌아가도록 에러 전달
                setApiError({
                    message: '이미 가입된 백준 아이디입니다. 다른 BOJ ID를 사용해주세요.',
                    code: errorCode,
                    status: errorStatus,
                });
                return;
            }

            if (errorStatus === 400 && errorCode === 'COMMON_VALIDATION_FAILED') {
                // 유효성 검사 실패
                toast.error('입력 정보가 올바르지 않습니다. 조건을 다시 확인해주세요.');
                return;
            }

            if (errorStatus === 404) {
                // BOJ 계정을 찾을 수 없음 (검증 단계 실패)
                setApiError({
                    message: '존재하지 않는 백준 아이디입니다. 아이디를 확인해주세요.',
                    code: errorCode,
                    status: errorStatus,
                });
                return;
            }

            toastApiError(error, '회원가입 중 오류가 발생했습니다.');
        }
    };

    const oauthState = parseOAuthSignupState(location.state);
    if (oauthState) {
        return <SignupFinalizePage />;
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="max-w-3xl w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">회원가입</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">체계적인 알고리즘 학습을 시작하세요</p>
                </div>

                <SignupWizard
                    onComplete={handleComplete}
                    apiError={apiError}
                    onClearApiError={() => setApiError(null)}
                />
            </div>
        </div>
    );
};

