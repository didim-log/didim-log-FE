/**
 * 비밀번호 찾기 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/endpoints/auth.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validation } from '../../../utils/validation';
import { toast } from 'sonner';
import { isApiErrorWithResponse } from '../../../types/api/common.types';
import { toastApiError } from '../../../utils/toastApiError';
import { ThemeToggle } from '../../../components/common/ThemeToggle';

export const FindPasswordPage: FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [bojId, setBojId] = useState('');
    const [errors, setErrors] = useState<{ email?: string; bojId?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setErrors({ email: '이메일을 입력해주세요.' });
            return;
        }

        if (!validation.isValidEmail(email.trim())) {
            setErrors({ email: '올바른 이메일 형식이 아닙니다.' });
            return;
        }

        const bojIdValidation = validation.isValidBojId(bojId.trim());
        if (!bojIdValidation.valid) {
            setErrors({ bojId: bojIdValidation.message || '올바른 BOJ ID 형식이 아닙니다.' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const response = await authApi.findPassword({ email: email.trim(), bojId: bojId.trim() });
            setIsSuccess(true);
            toast.success(response.message || '이메일로 비밀번호 재설정 코드가 전송되었습니다.');
        } catch (err: unknown) {
            if (isApiErrorWithResponse(err) && err.response.status === 404) {
                setErrors({ bojId: '정보를 찾을 수 없습니다.' });
                return;
            }
            toastApiError(err, '비밀번호 재설정 코드 발송에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
                <ThemeToggle className="absolute top-4 right-4" />
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">비밀번호 찾기</h2>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    이메일 전송 완료
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                    입력하신 이메일 주소로 비밀번호 재설정 코드가 전송되었습니다. 이메일을 확인해주세요.
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    코드는 30분간 유효합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/reset-password')}
                            variant="primary"
                            size="lg"
                            className="w-full"
                        >
                            비밀번호 재설정하기
                        </Button>
                        <Button
                            onClick={() => navigate('/login')}
                            variant="outline"
                            size="lg"
                            className="w-full"
                        >
                            로그인으로 돌아가기
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">비밀번호 찾기</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">가입 시 등록한 이메일과 BOJ ID를 입력해주세요</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="이메일"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="example@email.com"
                        disabled={isSubmitting}
                        autoComplete="email"
                        error={errors.email}
                    />

                    <Input
                        label="BOJ ID"
                        type="text"
                        value={bojId}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[a-zA-Z0-9_]*$/.test(value)) {
                                setBojId(value);
                            }
                            setErrors((prev) => ({ ...prev, bojId: undefined }));
                        }}
                        placeholder="백준 온라인 저지 ID"
                        disabled={isSubmitting}
                        autoComplete="username"
                        helperText="영문, 숫자, 언더스코어(_)만 사용 가능"
                        error={errors.bojId}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? '전송 중...' : '비밀번호 재설정 코드 발송'}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                        ← 로그인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
};


