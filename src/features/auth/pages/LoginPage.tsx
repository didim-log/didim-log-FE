/**
 * 로그인 페이지
 */

import { useState, useEffect, useRef } from 'react';
import type { FC, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../../hooks/auth/useLogin';
import { Button } from '../../../components/ui/Button';
import { validation } from '../../../utils/validation';
import { systemApi } from '../../../api/endpoints/system.api';
import type { SystemStatusResponse } from '../../../types/api/system.types';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { SERVER_ROOT } from '../../../config/env';

export const LoginPage: FC = () => {
    const navigate = useNavigate();
    const [bojId, setBojId] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ bojId?: { message: string; type?: string }; password?: string }>({});
    const [touched, setTouched] = useState<{ bojId: boolean; password: boolean }>({ bojId: false, password: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shouldFocusPassword, setShouldFocusPassword] = useState(false);
    const [serverError, setServerError] = useState<{
        message: string;
        status?: number;
        remainingAttempts?: number;
        unlockTime?: string;
    } | null>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const submitLockRef = useRef(false);
    const lastSubmitAtRef = useRef(0);
    const [maintenanceStatus, setMaintenanceStatus] = useState<SystemStatusResponse | null>(null);
    const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);

    const { login } = useLogin();

    // 유지보수 상태 확인
    useEffect(() => {
        let isMounted = true;

        const checkMaintenanceStatus = async () => {
            try {
                const status = await systemApi.getSystemStatus();
                if (isMounted) {
                    setMaintenanceStatus(status);
                }
            } catch {
                // 에러가 발생해도 로그인은 가능하도록 함
                // 503 에러(유지보수 모드)인 경우에도 정상적으로 처리
                if (isMounted) {
                    setMaintenanceStatus(null);
                }
            } finally {
                if (isMounted) {
                    setIsCheckingMaintenance(false);
                }
            }
        };

        checkMaintenanceStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    // 비밀번호 입력창 포커스 이동 (입력창이 enabled 된 이후에만)
    useEffect(() => {
        if (!shouldFocusPassword) {
            return;
        }
        if (isSubmitting) {
            return;
        }
        // 다음 틱에서 포커스 (렌더 반영 보장)
        setTimeout(() => {
            passwordInputRef.current?.focus();
            setShouldFocusPassword(false);
        }, 0);
    }, [shouldFocusPassword, isSubmitting]);

    // 실시간 유효성 검사
    useEffect(() => {
        const bojIdValidation = validation.isValidBojId(bojId);
        if (touched.bojId && !bojIdValidation.valid) {
            setErrors((prev) => ({ ...prev, bojId: { message: bojIdValidation.message || '유효하지 않은 BOJ ID입니다.' } }));
        } else if (touched.bojId && bojIdValidation.valid) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.bojId;
                return newErrors;
            });
        }
    }, [bojId, touched.bojId]);

    useEffect(() => {
        if (touched.password && !password.trim()) {
            setErrors((prev) => ({ ...prev, password: '비밀번호를 입력해주세요.' }));
        } else if (touched.password && password.trim()) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
    }, [password, touched.password]);

    // 폼 유효성 검사
    const isFormValid = () => {
        const bojIdValidation = validation.isValidBojId(bojId);
        return bojIdValidation.valid && password.trim().length >= 8;
    };

    const handleBojIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 영문, 숫자, 언더스코어만 허용
        if (value === '' || /^[a-zA-Z0-9_]*$/.test(value)) {
            setBojId(value);
        }
        setServerError(null);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setPassword(newValue);
        setServerError(null);
        
        // 사용자가 비밀번호를 입력하기 시작하면 필드 에러 초기화
        if (errors.password && newValue.length > 0) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
    };

    const handleBlur = (field: 'bojId' | 'password') => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // 상태 업데이트 전에 연타로 중복 호출되는 것을 막기 위한 동기 락
        if (submitLockRef.current) {
            return;
        }
        setTouched({ bojId: true, password: true });

        const bojIdValidation = validation.isValidBojId(bojId);
        if (!bojIdValidation.valid) {
            setErrors({ bojId: { message: bojIdValidation.message || '유효하지 않은 BOJ ID입니다.' } });
            return;
        }

        if (!password.trim()) {
            setErrors({ password: '비밀번호를 입력해주세요.' });
            return;
        }

        if (password.trim().length < 8) {
            setErrors({ password: '비밀번호는 최소 8자 이상이어야 합니다.' });
            return;
        }

        setErrors({});
        setServerError(null);

        const now = Date.now();
        if (now - lastSubmitAtRef.current < 1000) {
            return;
        }

        submitLockRef.current = true;
        lastSubmitAtRef.current = now;
        setIsSubmitting(true);

        login(
            { bojId: bojId.trim(), password },
            {
                onError: (error) => {
                    setServerError({
                        message: error.message || '로그인 중 오류가 발생했습니다.',
                        status: error.status,
                        remainingAttempts: error.remainingAttempts,
                        unlockTime: error.unlockTime,
                    });
                    setShouldFocusPassword(true);
                },
                onSettled: () => {
                    setIsSubmitting(false);
                    submitLockRef.current = false;
                },
            }
        );
    };

    const handleOAuthLogin = (provider: 'google' | 'github' | 'naver') => {
        window.location.href = `${SERVER_ROOT}/oauth2/authorization/${provider}`;
    };

    const formatMaintenanceTime = (startTime: string, endTime: string): string => {
        try {
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            const formatDate = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}.${month}.${day} ${hours}:${minutes}`;
            };
            
            const formatTime = (date: Date): string => {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            };
            
            // 같은 날이면 날짜는 한 번만 표시
            if (start.toDateString() === end.toDateString()) {
                return `${formatDate(start)} ~ ${formatTime(end)}`;
            }
            
            return `${formatDate(start)} ~ ${formatDate(end)}`;
        } catch {
            return `${startTime} ~ ${endTime}`;
        }
    };

    const isUnderMaintenance = !isCheckingMaintenance && maintenanceStatus?.underMaintenance;

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="max-w-md w-full space-y-8 p-8">
                {/* 헤더 */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">디딤로그</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">로그인</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">체계적인 알고리즘 학습을 시작하세요</p>
                </div>

                {/* 유지보수 알림 배너 */}
                {isUnderMaintenance && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 rounded-md p-4 mb-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                                    🚨 현재 서버 점검 중입니다.
                                </p>
                                {maintenanceStatus?.startTime && maintenanceStatus?.endTime && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                                        점검 시간: {formatMaintenanceTime(maintenanceStatus.startTime, maintenanceStatus.endTime)}
                                    </p>
                                )}
                                {maintenanceStatus?.noticeId && (
                                    <button
                                        onClick={() => navigate(`/notices/${maintenanceStatus.noticeId}`)}
                                        className="text-xs text-red-700 dark:text-red-300 underline hover:text-red-900 dark:hover:text-red-100 font-medium"
                                    >
                                        점검 상세 내용 보기 &gt;
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 로그인 폼 */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="bojId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                BOJ ID
                            </label>
                            <input
                                id="bojId"
                                type="text"
                                value={bojId}
                                onChange={handleBojIdChange}
                                onBlur={() => handleBlur('bojId')}
                                placeholder="백준 온라인 저지 ID"
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                    errors.bojId
                                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                autoComplete="username"
                            />
                            {errors.bojId && (
                                <div className="mt-1.5">
                                    <div className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1">
                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {errors.bojId.type === 'NOT_FOUND' ? (
                                            <div className="flex-1">
                                                존재하지 않는 계정입니다.{' '}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        navigate('/signup');
                                                    }}
                                                    className="font-medium underline hover:text-red-500 text-red-600 dark:text-red-400 bg-transparent border-0 p-0 cursor-pointer"
                                                >
                                                    회원가입
                                                </button>
                                                을 먼저 진행해주세요.
                                            </div>
                                        ) : (
                                            <div className="flex-1">{errors.bojId.message}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {!touched.bojId && (
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">영문, 숫자, 언더스코어(_)만 사용 가능</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                비밀번호
                            </label>
                            <input
                                ref={passwordInputRef}
                                id="password"
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={() => handleBlur('password')}
                                placeholder="비밀번호를 입력하세요"
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                    errors.password
                                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                            {!touched.password && (
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">최소 8자 이상 입력해주세요</p>
                            )}
                        </div>
                    </div>

                    {/* 로그인 에러 표시 */}
                    {serverError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 rounded-lg space-y-2">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                        {serverError.message}
                                    </p>
                                    {/* Rate Limit 정보 표시 */}
                                    {serverError.remainingAttempts !== undefined && serverError.remainingAttempts > 0 && (
                                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                            남은 시도 횟수: {serverError.remainingAttempts}회
                                        </p>
                                    )}
                                    {serverError.status === 429 && serverError.unlockTime && (
                                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                            {(() => {
                                                try {
                                                    const unlockDate = new Date(serverError.unlockTime);
                                                    const formattedTime = unlockDate.toLocaleString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    });
                                                    return `${formattedTime}에 다시 시도 가능합니다.`;
                                                } catch {
                                                    return '1시간 후 다시 시도해주세요.';
                                                }
                                            })()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={!isFormValid() || isSubmitting}
                        className={`w-full font-semibold transition-all duration-200 ${
                            isFormValid() && !isSubmitting
                                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? '로그인 중...' : '로그인'}
                    </Button>
                </form>

                {/* 아이디/비밀번호 찾기 */}
                <div className="text-center text-sm">
                    <Link to="/find-id" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        아이디 찾기
                    </Link>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                    <Link to="/find-password" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        비밀번호 찾기
                    </Link>
                </div>

                {/* 구분선 */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">또는</span>
                    </div>
                </div>

                {/* 소셜 로그인 */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => handleOAuthLogin('google')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOAuthLogin('github')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 dark:bg-gray-800 text-white transition-colors hover:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="font-medium">GitHub</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOAuthLogin('naver')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-green-500 dark:bg-green-600 text-white transition-colors hover:bg-green-600 dark:hover:bg-green-700"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                        </svg>
                        <span className="font-medium">Naver</span>
                    </button>
                </div>

                {/* 회원가입 링크 */}
                <div className="text-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">계정이 없으신가요? </span>
                    <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    );
};
