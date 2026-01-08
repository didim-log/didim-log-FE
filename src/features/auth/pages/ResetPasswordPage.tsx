/**
 * 비밀번호 재설정 페이지
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/endpoints/auth.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validation } from '../../../utils/validation';
import { toast } from 'sonner';
import { toastApiError } from '../../../utils/toastApiError';
import { ThemeToggle } from '../../../components/common/ThemeToggle';

export const ResetPasswordPage: FC = () => {
    const navigate = useNavigate();
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{
        resetCode?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!resetCode.trim()) {
            setErrors({ resetCode: '재설정 코드를 입력해주세요.' });
            return;
        }

        if (!newPassword.trim()) {
            setErrors({ newPassword: '새 비밀번호를 입력해주세요.' });
            return;
        }

        const passwordValidation = validation.isValidPassword(newPassword);
        if (!passwordValidation.valid) {
            setErrors({ newPassword: passwordValidation.message || '비밀번호 형식이 올바르지 않습니다.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await authApi.resetPassword({
                resetCode: resetCode.trim(),
                newPassword: newPassword,
            });
            setIsSuccess(true);
            toast.success('비밀번호가 성공적으로 변경되었습니다.');
        } catch (err: unknown) {
            toastApiError(err, '비밀번호 변경에 실패했습니다.');
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
        <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">비밀번호 재설정</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">이메일로 받은 재설정 코드와 새 비밀번호를 입력해주세요</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="재설정 코드"
                        type="text"
                        value={resetCode}
                        onChange={(e) => {
                            setResetCode(e.target.value);
                            setErrors((prev) => ({ ...prev, resetCode: undefined }));
                        }}
                        placeholder="이메일로 받은 8자리 코드"
                        disabled={isSubmitting}
                        autoComplete="off"
                        error={errors.resetCode}
                    />

                    <Input
                        label="새 비밀번호"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, newPassword: undefined }));
                        }}
                        placeholder="새 비밀번호를 입력하세요"
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        helperText="영문, 숫자, 특수문자 중 2종류 이상 조합 시 최소 10자, 3종류 이상 조합 시 최소 8자"
                        error={errors.newPassword}
                    />

                    <Input
                        label="새 비밀번호 확인"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        error={errors.confirmPassword}
                    />

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
