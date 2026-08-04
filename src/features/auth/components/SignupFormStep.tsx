/**
 * 회원가입 폼 단계 컴포넌트
 */

import { useState, useEffect, useRef } from 'react';
import type { FC, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validation } from '../../../utils/validation';
import { Check, X } from 'lucide-react';
import type { OAuthSignupState } from '@/types/auth/oauth.types';
import { toast } from 'sonner';
import {
    getOAuthSignupEmailViewModel,
    GITHUB_PRIVATE_EMAIL_TOAST_MESSAGE,
} from '../utils/oauthSignupEmail';

const SOLVED_AC_URL = 'https://solved.ac/';

interface SignupFormStepProps {
    demoMode?: boolean;
    bojId: string;
    onComplete: (data: { email: string; password: string }) => void;
    onBack: () => void;
    oauthSignupState?: OAuthSignupState | null;
    apiError?: {
        message: string;
        code?: string;
        status?: number;
        fieldErrors?: Record<string, string[]>;
    } | null;
}

interface SignupFormErrors {
    email?: string;
    password?: string;
    passwordConfirm?: string;
    bojId?: string;
}

const createErrorsFromApiError = (apiError: SignupFormStepProps['apiError']): SignupFormErrors => {
    if (!apiError) {
        return {};
    }

    if (apiError.code === 'DUPLICATE_BOJ_ID') {
        return { bojId: apiError.message };
    }

    if (apiError.status === 404) {
        return { bojId: apiError.message };
    }

    if (!apiError.fieldErrors) {
        return {};
    }

    const fieldErrors: SignupFormErrors = {};
    if (apiError.fieldErrors.email) {
        fieldErrors.email = apiError.fieldErrors.email.join(', ');
    }
    if (apiError.fieldErrors.password) {
        fieldErrors.password = apiError.fieldErrors.password.join(', ');
    }
    if (apiError.fieldErrors.bojId) {
        fieldErrors.bojId = apiError.fieldErrors.bojId.join(', ');
    }
    return fieldErrors;
};

const isSolvedAcOnboardingHintTargetError = (errorMessage?: string): boolean => {
    if (!errorMessage) {
        return false;
    }

    const normalized = errorMessage.toLowerCase();
    if (normalized.includes('not found')) {
        return true;
    }

    return errorMessage.includes('존재하지 않는');
};

export const SignupFormStep: FC<SignupFormStepProps> = ({
    demoMode = false,
    bojId,
    onComplete,
    onBack,
    oauthSignupState = null,
    apiError,
}) => {
    const oauthEmailViewModel = getOAuthSignupEmailViewModel(oauthSignupState);

    const [email, setEmail] = useState(() => (demoMode ? 'demo@didimlog.dev' : oauthEmailViewModel.email));
    const [password, setPassword] = useState(() => (demoMode ? 'Demo1234!' : ''));
    const [passwordConfirm, setPasswordConfirm] = useState(() => (demoMode ? 'Demo1234!' : ''));
    const [errors, setErrors] = useState<SignupFormErrors>(() => createErrorsFromApiError(apiError));
    const [passwordPolicy, setPasswordPolicy] = useState(validation.getPasswordPolicyDetails(''));
    const bojIdInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!oauthEmailViewModel.shouldShowGithubPrivateEmailToast) {
            return;
        }

        toast.message(GITHUB_PRIVATE_EMAIL_TOAST_MESSAGE);
    }, [oauthEmailViewModel.shouldShowGithubPrivateEmailToast]);

    // API 에러 처리
    useEffect(() => {
        const nextErrors = createErrorsFromApiError(apiError);
        if (Object.keys(nextErrors).length === 0) {
            return;
        }

        setErrors(nextErrors);
        if (apiError?.code === 'DUPLICATE_BOJ_ID') {
            bojIdInputRef.current?.focus();
        }
    }, [apiError]);

    // 비밀번호 정책 실시간 검증
    useEffect(() => {
        setPasswordPolicy(validation.getPasswordPolicyDetails(password));
    }, [password]);

    const handleSubmit = (e: FormEvent) => {
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

        if (!password.trim()) {
            setErrors({ password: '비밀번호를 입력해주세요.' });
            return;
        }

        const passwordValidation = validation.isValidPassword(password);
        if (!passwordValidation.valid) {
            setErrors({ password: passwordValidation.message });
            return;
        }

        if (password !== passwordConfirm) {
            setErrors({ passwordConfirm: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        onComplete({ email: email.trim(), password });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">회원가입 정보 입력</h2>
                <p className="text-gray-600 dark:text-gray-400">이메일과 비밀번호를 입력해주세요.</p>
                <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        인증된 BOJ ID
                    </label>
                    <div className="relative">
                        <input
                            ref={bojIdInputRef}
                            type="text"
                            value={bojId}
                            readOnly
                            disabled
                            className={`w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed ${
                                errors.bojId
                                    ? 'border-red-500 dark:border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}
                        />
                    </div>
                    {errors.bojId && (
                        <div className="mt-1.5">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {errors.bojId}
                            </p>
                            {isSolvedAcOnboardingHintTargetError(errors.bojId) && <SolvedAcOnboardingHint />}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="이메일"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="example@email.com"
                    autoComplete="email"
                    readOnly={oauthEmailViewModel.isLocked}
                />

                <div>
                    <Input
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="new-password"
                    />
                    
                    {/* 비밀번호 정책 실시간 피드백 */}
                    {password && (
                        <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                                {passwordPolicy.hasNoSpace ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                )}
                                <span className={passwordPolicy.hasNoSpace ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    공백 없음
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {passwordPolicy.hasLetter ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                <span className={passwordPolicy.hasLetter ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                    영문 포함
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {passwordPolicy.hasNumber ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                <span className={passwordPolicy.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                    숫자 포함
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {passwordPolicy.hasSpecial ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                <span className={passwordPolicy.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                    특수문자 포함
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {passwordPolicy.typeCount >= 2 ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                )}
                                <span className={passwordPolicy.typeCount >= 2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {passwordPolicy.typeCount >= 3 
                                        ? '3종류 이상 조합 (최소 8자)' 
                                        : passwordPolicy.typeCount >= 2
                                        ? '2종류 이상 조합 (최소 10자)'
                                        : '2종류 이상 필요'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {passwordPolicy.currentLength >= passwordPolicy.minLength ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                )}
                                <span className={passwordPolicy.currentLength >= passwordPolicy.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {passwordPolicy.currentLength}자 / 최소 {passwordPolicy.minLength}자
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <Input
                    label="비밀번호 확인"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    error={errors.passwordConfirm}
                    placeholder="비밀번호를 다시 입력하세요"
                    autoComplete="new-password"
                />

                <div className="flex justify-between pt-4">
                    <Button type="button" onClick={onBack} variant="outline">
                        이전
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={!passwordPolicy.isValid || password !== passwordConfirm}
                    >
                        회원가입 완료
                    </Button>
                </div>
            </form>
        </div>
    );
};

const SolvedAcOnboardingHint: FC = () => {
    return (
        <div className="mt-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                💡 <strong>방금 만든 계정인가요?</strong>
                <br />
                Solved.ac에 등록되지 않은 아이디일 수 있어요. 아래 링크에서 <strong>[사용 하기]</strong> 설정을 완료해 주세요.
            </p>
            <div className="mt-2">
                <a
                    href={SOLVED_AC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Solved.ac 바로가기 →
                </a>
            </div>
        </div>
    );
};
