/**
 * BOJ 인증 단계 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useBojVerify } from '../../../hooks/auth/useBojVerify';
import { authApi } from '../../../api/endpoints/auth.api';
import { validation } from '../../../utils/validation';
import { isApiError } from '../../../types/api/common.types';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getBojVerifyErrorViewModel } from '../utils/bojVerifyError';
import { BojVerifyErrorGuide } from './BojVerifyErrorGuide';
import type { BojVerifyErrorGuide as BojVerifyErrorGuideModel } from '../utils/bojVerifyError';

interface BojVerifyStepProps {
    onNext: (bojId: string) => void;
    onBack: () => void;
    duplicateError?: string | null;
    onErrorClear?: () => void;
}

export const BojVerifyStep: FC<BojVerifyStepProps> = ({ onNext, onBack, duplicateError, onErrorClear }) => {
    const [bojId, setBojId] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [errorGuide, setErrorGuide] = useState<BojVerifyErrorGuideModel | null>(null);
    const { issueCode, verify, code, isLoading } = useBojVerify();
    const error = duplicateError ?? localError;

    // bojId가 변경되면 중복 에러 초기화
    const handleBojIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBojId(e.target.value);
        if (duplicateError || error) {
            setLocalError(null);
            setErrorGuide(null);
            onErrorClear?.();
        }
    };

    const setVerifyError = (err: unknown) => {
        const viewModel = getBojVerifyErrorViewModel(err, bojId.trim());
        setLocalError(viewModel.message);
        setErrorGuide(viewModel.guide ?? null);
    };

    const handleIssueCode = async () => {
        setLocalError(null);
        setErrorGuide(null);
        if (!bojId.trim()) {
            setLocalError('BOJ ID를 입력해주세요.');
            return;
        }

        const bojIdValidation = validation.isValidBojId(bojId.trim());
        if (!bojIdValidation.valid) {
            setLocalError(bojIdValidation.message ?? '올바른 BOJ ID 형식이 아닙니다.');
            return;
        }

        try {
            // 중복 가입 여부 체크 (인증 코드 발급 전에 미리 방어)
            const isDuplicate = await authApi.checkIdDuplicate(bojId.trim());
            if (isDuplicate) {
                setLocalError('이미 가입된 백준 아이디입니다.');
                setErrorGuide({
                    title: '이미 가입된 아이디입니다',
                    description: '입력하신 BOJ ID로 이미 회원가입이 완료된 계정입니다.',
                    steps: [
                        '이 BOJ ID로 로그인을 진행해주세요.',
                        '비밀번호를 잊으셨다면 비밀번호 찾기를 이용해주세요.',
                    ],
                    links: [
                        { text: '로그인 페이지로 이동', url: '/login' },
                        { text: '비밀번호 찾기', url: '/find-password' },
                    ],
                });
                return; // 코드 발급 중단
            }

            // 중복이 아니면 인증 코드 발급 진행
            await issueCode();
        } catch (err: unknown) {
            // Axios 에러 처리: 백엔드에서 반환한 메시지 우선 사용
            if (!isApiError(err)) {
                setLocalError('인증 코드 발급에 실패했습니다. 잠시 후 다시 시도해주세요.');
                setErrorGuide({
                    title: '서버 오류가 발생했습니다',
                    description: '네트워크 오류 또는 서버 문제로 인증 코드 발급에 실패했습니다.',
                    steps: [
                        '인터넷 연결을 확인해주세요.',
                        '잠시 후 다시 시도해주세요.',
                        '문제가 계속되면 페이지를 새로고침해주세요.',
                    ],
                });
                return;
            }
            const errorCode = err.response?.data?.code;
            if (err.response?.status === 404 && errorCode === 'COMMON_RESOURCE_NOT_FOUND') {
                const viewModel = getBojVerifyErrorViewModel(err, bojId.trim());
                setLocalError(viewModel.message);
                setErrorGuide(viewModel.guide ?? null);
                return;
            }
            const apiMessage = err.response?.data?.message;
            if (apiMessage) {
                setLocalError(apiMessage);
                setErrorGuide({
                    title: '인증 코드 발급 실패',
                    description: '서버에서 오류가 발생했습니다.',
                    steps: ['잠시 후 다시 시도해주세요.'],
                });
                return;
            }
            setLocalError('인증 코드 발급에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setErrorGuide({
                title: '서버 오류가 발생했습니다',
                description: '예상치 못한 오류가 발생했습니다.',
                steps: ['잠시 후 다시 시도해주세요.', '문제가 계속되면 페이지를 새로고침해주세요.'],
            });
        }
    };

    const handleVerify = async () => {
        setLocalError(null);
        setErrorGuide(null);
        if (!bojId.trim()) {
            setLocalError('BOJ ID를 입력해주세요.');
            return;
        }

        try {
            // BOJ 소유권 인증
            const result = await verify(bojId.trim());
            if (!result.verified) {
                setLocalError(
                    '인증에 실패했습니다. BOJ 프로필 상태 메시지에 발급된 코드를 정확히 입력했는지 확인해주세요.'
                );
                return;
            }

            // 인증 성공: verifiedBojId를 사용하여 다음 단계로 진행
            // 백엔드에서 반환한 verifiedBojId가 있으면 사용, 없으면 입력한 bojId 사용
            const verifiedBojId = result.verifiedBojId || bojId.trim();
            onNext(verifiedBojId);
        } catch (err: unknown) {
            setVerifyError(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">BOJ 아이디 인증</h2>
                <p className="text-gray-600 dark:text-gray-400">백준 온라인 저지 아이디의 소유권을 인증합니다.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <Input
                        label="BOJ ID"
                        type="text"
                        value={bojId}
                        onChange={handleBojIdChange}
                        error={error && !error.includes('이미 가입된') ? error : undefined}
                        placeholder="백준 온라인 저지 ID"
                        disabled={isLoading}
                    />
                    {error && error.includes('이미 가입된') && (
                        <div className="mt-1.5">
                            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                                {error}
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
                            >
                                로그인 페이지로 이동 →
                            </Link>
                        </div>
                    )}
                </div>

                {errorGuide && (
                    <BojVerifyErrorGuide guide={errorGuide} />
                )}

                {code && (
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">인증 코드</p>
                            <div className="flex items-center gap-3">
                                <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 flex-1 break-all">{code}</p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(code);
                                        toast.success('인증 코드가 복사되었습니다.');
                                    }}
                                    className="p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
                                    title="코드 복사"
                                >
                                    <Copy className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2.5 text-sm text-blue-800 dark:text-blue-200">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100 min-w-[1.5rem]">1.</span>
                                <span>위 인증 코드를 복사하세요</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100 min-w-[1.5rem]">2.</span>
                                <span>
                                    <a
                                        href="https://www.acmicpc.net/modify"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
                                    >
                                        백준 프로필 수정 페이지
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    에서 <strong>"상태 메시지"</strong>에 코드를 붙여넣고 저장하세요
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100 min-w-[1.5rem]">3.</span>
                                <span>저장 후 아래 "인증 확인" 버튼을 클릭하세요</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                            <strong>💡</strong> 코드는 정확히 입력해야 합니다. 공백이나 오타가 있으면 인증에 실패합니다.
                        </div>
                    </div>
                )}

                {/* 프로필 확인 링크 - 인증 코드가 발급된 후에만 표시 */}
                {code && bojId.trim() && validation.isValidBojId(bojId.trim()).valid && (
                    <div className="flex justify-center mt-4">
                        <a
                            href={`https://www.acmicpc.net/user/${bojId.trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                            내 백준 프로필 확인하러 가기
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <Button onClick={onBack} variant="outline">
                    이전
                </Button>
                <div className="space-x-2">
                    {!code ? (
                        <Button onClick={handleIssueCode} variant="primary" isLoading={isLoading}>
                            인증 코드 발급
                        </Button>
                    ) : (
                        <Button onClick={handleVerify} variant="primary" isLoading={isLoading}>
                            인증 확인
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

