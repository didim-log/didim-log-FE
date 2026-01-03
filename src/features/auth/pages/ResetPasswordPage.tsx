/**
 * 비밀번호 재설정 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/endpoints/auth.api';
import { Button } from '../../../components/ui/Button';
import { validation } from '../../../utils/validation';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../types/api/common.types';

export const ResetPasswordPage: FC = () => {
    const navigate = useNavigate();
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!resetCode.trim()) {
            setError('재설정 코드를 입력해주세요.');
            return;
        }

        if (!newPassword.trim()) {
            setError('새 비밀번호를 입력해주세요.');
            return;
        }

        const passwordValidation = validation.isValidPassword(newPassword);
        if (!passwordValidation.valid) {
            setError(passwordValidation.message || '비밀번호 형식이 올바르지 않습니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await authApi.resetPassword({
                resetCode: resetCode.trim(),
                newPassword: newPassword,
            });
            setIsSuccess(true);
            toast.success('비밀번호가 성공적으로 변경되었습니다.');
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">비밀번호 재설정</h2>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    비밀번호 변경 완료
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate('/login')}
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        로그인하기
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">비밀번호 재설정</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">이메일로 받은 재설정 코드와 새 비밀번호를 입력해주세요</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            재설정 코드
                        </label>
                        <input
                            id="resetCode"
                            type="text"
                            value={resetCode}
                            onChange={(e) => {
                                setResetCode(e.target.value);
                                setError(null);
                            }}
                            placeholder="이메일로 받은 8자리 코드"
                            disabled={isSubmitting}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                error
                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            새 비밀번호
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setError(null);
                            }}
                            placeholder="새 비밀번호를 입력하세요"
                            disabled={isSubmitting}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                error
                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            autoComplete="new-password"
                        />
                        {!error && (
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                영문, 숫자, 특수문자 중 2종류 이상 조합 시 최소 10자, 3종류 이상 조합 시 최소 8자
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            새 비밀번호 확인
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError(null);
                            }}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            disabled={isSubmitting}
                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                error
                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            autoComplete="new-password"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 rounded-lg">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? '변경 중...' : '비밀번호 변경'}
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


