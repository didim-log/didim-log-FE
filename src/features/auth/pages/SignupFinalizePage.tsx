/**
 * 회원가입 마무리 페이지 (소셜 로그인용)
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api/endpoints/auth.api';
import { useAuthStore } from '../../../stores/auth.store';
import { useOnboardingStore } from '../../../stores/onboarding.store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validation } from '../../../utils/validation';
import type { SignupFinalizeRequest } from '../../../types/api/auth.types';
import { toastApiError } from '../../../utils/toastApiError';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { parseOAuthSignupState } from '../../../types/auth/oauth.types';

export const SignupFinalizePage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setTokens, setUser } = useAuthStore();
    const { setIsNewUser } = useOnboardingStore();

    const oauthState = parseOAuthSignupState(location.state);

    const [email, setEmail] = useState(() => oauthState?.email ?? '');
    const [nickname, setNickname] = useState('');
    const [bojId, setBojId] = useState('');
    const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        nickname?: string;
        bojId?: string;
        terms?: string;
    }>({});

    useEffect(() => {
        if (!oauthState) {
            navigate('/login', { replace: true });
            return;
        }
    }, [oauthState, navigate]);

    const finalizeMutation = useMutation({
        mutationFn: (data: SignupFinalizeRequest) => authApi.signupFinalize(data),
        onSuccess: async (data) => {
            setTokens(data.token, data.refreshToken);
            setIsNewUser(true);

            const user = {
                id: '',
                nickname,
                bojId: bojId || null,
                email,
                role: 'USER' as const,
                rating: data.rating,
                tier: data.tier,
                tierLevel: data.tierLevel,
                provider: oauthState?.provider || 'GOOGLE',
            };
            setUser(user);

            navigate('/dashboard', { replace: true });
        },
        onError: (error: unknown) => {
            toastApiError(error, '회원가입에 실패했습니다.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!email.trim()) {
            setErrors({ email: '이메일을 입력해주세요.' });
            return;
        }

        if (!validation.isValidEmail(email.trim())) {
            setErrors({ email: '올바른 이메일 형식이 아닙니다.' });
            return;
        }

        if (!nickname.trim()) {
            setErrors({ nickname: '닉네임을 입력해주세요.' });
            return;
        }

        if (!validation.isValidNickname(nickname.trim())) {
            setErrors({ nickname: '닉네임은 2자 이상 20자 이하여야 합니다.' });
            return;
        }

        if (bojId.trim() && !validation.isValidBojId(bojId.trim())) {
            setErrors({ bojId: '올바른 BOJ ID 형식이 아닙니다.' });
            return;
        }

        if (!isAgreedToTerms) {
            setErrors({ terms: '약관에 동의해주세요.' });
            return;
        }

        if (!oauthState?.provider || !oauthState?.providerId) {
            setErrors({ email: '소셜 로그인 정보가 없습니다.' });
            return;
        }

        finalizeMutation.mutate({
            email: email.trim(),
            provider: oauthState.provider,
            providerId: oauthState.providerId,
            nickname: nickname.trim(),
            bojId: bojId.trim() || null,
            isAgreedToTerms: true,
        });
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4 text-gray-900 dark:text-white">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">회원가입 마무리</h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-2">추가 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {oauthState?.profileImage && (
                        <div className="flex items-center justify-center">
                            <img
                                src={oauthState.profileImage}
                                alt="프로필 이미지"
                                className="w-14 h-14 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    )}
                    <Input
                        label="이메일"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="example@email.com"
                        required
                    />

                    <Input
                        label="닉네임"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        error={errors.nickname}
                        placeholder="닉네임을 입력하세요"
                        required
                    />

                    <Input
                        label="BOJ ID (선택)"
                        type="text"
                        value={bojId}
                        onChange={(e) => setBojId(e.target.value)}
                        error={errors.bojId}
                        placeholder="백준 온라인 저지 ID (선택사항)"
                    />

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="terms-agree"
                            checked={isAgreedToTerms}
                            onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="terms-agree" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            약관에 동의합니다 (필수)
                        </label>
                    </div>
                    {errors.terms && <p className="text-red-600 dark:text-red-400 text-sm">{errors.terms}</p>}

                    <Button type="submit" variant="primary" size="lg" isLoading={finalizeMutation.isPending} className="w-full">
                        회원가입 완료
                    </Button>
                </form>
            </div>
        </div>
    );
};


