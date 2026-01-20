/**
 * 아이디 찾기 페이지
 */

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/endpoints/auth.api';
import { Button } from '../../../components/ui/Button';
import { validation } from '../../../utils/validation';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../types/api/common.types';
import { ThemeToggle } from '../../../components/common/ThemeToggle';

export const FindIdPage: FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('이메일을 입력해주세요.');
            return;
        }

        if (!validation.isValidEmail(email.trim())) {
            setError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await authApi.findId({ email: email.trim() });
            setIsSuccess(true);
            toast.success(response.message || '이메일로 아이디가 전송되었습니다.');
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            // 404 에러인 경우 특정 메시지 표시
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as { response?: { status?: number } };
                if (apiError.response?.status === 404) {
                    setError('일치하는 정보가 없습니다.');
                } else {
                    setError(errorMessage);
                }
            } else {
                setError(errorMessage || '일치하는 정보가 없습니다.');
            }
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
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">아이디 찾기</h2>
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
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    입력하신 이메일 주소로 BOJ ID가 전송되었습니다. 이메일을 확인해주세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/login')}
                            variant="primary"
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
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">아이디 찾기</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">가입 시 등록한 이메일 주소를 입력해주세요</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(null);
                            }}
                            placeholder="example@email.com"
                            disabled={isSubmitting}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                error
                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            autoComplete="email"
                        />
                        {error && (
                            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {error}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? '전송 중...' : '아이디 찾기'}
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
