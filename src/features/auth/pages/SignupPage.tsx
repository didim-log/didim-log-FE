/**
 * 회원가입 페이지 (3단계 위저드)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupWizard } from '../components/SignupWizard';
import { authApi } from '../../../api/endpoints/auth.api';
import { useOnboardingStore } from '../../../stores/onboarding.store';
import { useAuthStore } from '../../../stores/auth.store';
import { toast } from 'sonner';
import { isApiError, getErrorMessage } from '../../../types/api/common.types';

export const SignupPage: FC = () => {
    const navigate = useNavigate();
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
            // fieldErrors는 백엔드에서 제공하지 않으므로 undefined로 처리
            const fieldErrors = undefined;

            if (errorStatus === 409 && errorCode === 'DUPLICATE_BOJ_ID') {
                // 이미 가입된 BOJ ID - SignupWizard에서 2단계로 돌아가도록 에러 전달
                setApiError({
                    message: '이미 가입된 백준 아이디입니다. 다른 BOJ ID를 사용해주세요.',
                    code: errorCode,
                    status: errorStatus,
                });
            } else if (errorStatus === 400 && errorCode === 'COMMON_VALIDATION_FAILED') {
                // 유효성 검사 실패
                setApiError({
                    message: '입력 정보가 올바르지 않습니다. 조건을 다시 확인해주세요.',
                    code: errorCode,
                    status: errorStatus,
                    fieldErrors,
                });
            } else if (errorStatus === 404) {
                // BOJ 계정을 찾을 수 없음 (검증 단계 실패)
                setApiError({
                    message: '존재하지 않는 백준 아이디입니다. 아이디를 확인해주세요.',
                    code: errorCode,
                    status: errorStatus,
                });
            } else {
                // 기타 서버 에러
                const errorMessage = getErrorMessage(error);
                setApiError({
                    message: errorMessage,
                    code: errorCode,
                    status: errorStatus,
                });
                toast.error('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
            <div className="max-w-3xl w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">회원가입</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">체계적인 알고리즘 학습을 시작하세요</p>
                </div>

                {/* DUPLICATE_BOJ_ID 에러는 2단계에서 처리하므로 상단 에러 박스 표시하지 않음 */}
                {apiError && apiError.code !== 'DUPLICATE_BOJ_ID' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 rounded-lg">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1">
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                                    {apiError.message}
                                </p>
                                {apiError.fieldErrors && Object.keys(apiError.fieldErrors).length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-xs text-red-600 dark:text-red-400">
                                        {Object.entries(apiError.fieldErrors).map(([field, messages]) => (
                                            <li key={field}>
                                                {field}: {messages.join(', ')}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <SignupWizard
                    onComplete={handleComplete}
                    apiError={apiError}
                    onClearApiError={() => setApiError(null)}
                />
            </div>
        </div>
    );
};

