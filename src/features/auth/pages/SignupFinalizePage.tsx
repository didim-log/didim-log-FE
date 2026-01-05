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

export const SignupFinalizePage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setTokens, setUser } = useAuthStore();
    const { setIsNewUser } = useOnboardingStore();

    const state = location.state as { email?: string; provider?: string; providerId?: string } | null;

    const [email, setEmail] = useState(() => state?.email ?? '');
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
        if (!state) {
            navigate('/login', { replace: true });
            return;
        }
    }, [state, navigate]);

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
                provider: (state?.provider?.toUpperCase() || 'GOOGLE') as 'GOOGLE' | 'GITHUB' | 'NAVER',
            };
            setUser(user);

            navigate('/dashboard', { replace: true });
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

        if (!state?.provider || !state?.providerId) {
            setErrors({ email: '소셜 로그인 정보가 없습니다.' });
            return;
        }

        finalizeMutation.mutate({
            email: email.trim(),
            provider: state.provider.toUpperCase() as 'GOOGLE' | 'GITHUB' | 'NAVER',
            providerId: state.providerId,
            nickname: nickname.trim(),
            bojId: bojId.trim() || null,
            isAgreedToTerms: true,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">회원가입 마무리</h2>
                    <p className="text-center text-gray-600 mt-2">추가 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="terms-agree" className="ml-2 text-sm text-gray-700">
                            약관에 동의합니다 (필수)
                        </label>
                    </div>
                    {errors.terms && <p className="text-red-600 text-sm">{errors.terms}</p>}

                    {finalizeMutation.error && (
                        <div className="text-red-600 text-sm">
                            {finalizeMutation.error instanceof Error
                                ? finalizeMutation.error.message
                                : '회원가입에 실패했습니다.'}
                        </div>
                    )}

                    <Button type="submit" variant="primary" size="lg" isLoading={finalizeMutation.isPending} className="w-full">
                        회원가입 완료
                    </Button>
                </form>
            </div>
        </div>
    );
};


