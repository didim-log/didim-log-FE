/**
 * BOJ 인증 단계 컴포넌트
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useBojVerify } from '../../../hooks/auth/useBojVerify';
import { authApi } from '../../../api/endpoints/auth.api';
import { validation } from '../../../utils/validation';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BojVerifyStepProps {
    onNext: (bojId: string) => void;
    onBack: () => void;
    duplicateError?: string | null;
    onErrorClear?: () => void;
}

export const BojVerifyStep: FC<BojVerifyStepProps> = ({ onNext, onBack, duplicateError, onErrorClear }) => {
    const [bojId, setBojId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { issueCode, verify, code, isLoading } = useBojVerify();

    // 중복 에러가 전달되면 로컬 에러로 설정
    useEffect(() => {
        if (duplicateError) {
            setError(duplicateError);
        }
    }, [duplicateError]);

    // bojId가 변경되면 중복 에러 초기화
    const handleBojIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBojId(e.target.value);
        if (duplicateError || error) {
            setError(null);
            onErrorClear?.();
        }
    };

    const handleIssueCode = async () => {
        setError(null);
        if (!bojId.trim()) {
            setError('BOJ ID를 입력해주세요.');
            return;
        }

        if (!validation.isValidBojId(bojId.trim())) {
            setError('올바른 BOJ ID 형식이 아닙니다. (3-20자, 영문/숫자/언더스코어만 가능)');
            return;
        }

        try {
            // 중복 가입 여부 체크 (인증 코드 발급 전에 미리 방어)
            const isDuplicate = await authApi.checkIdDuplicate(bojId.trim());
            if (isDuplicate) {
                setError('이미 가입된 백준 아이디입니다. 로그인을 진행해주세요.');
                return; // 코드 발급 중단
            }

            // 중복이 아니면 인증 코드 발급 진행
            await issueCode();
        } catch (err) {
            setError(err instanceof Error ? err.message : '인증 코드 발급에 실패했습니다.');
        }
    };

    const handleVerify = async () => {
        setError(null);
        if (!bojId.trim()) {
            setError('BOJ ID를 입력해주세요.');
            return;
        }

        try {
            // BOJ 소유권 인증
            const verified = await verify(bojId.trim());
            if (!verified) {
                setError('인증에 실패했습니다. BOJ 프로필 상태 메시지에 발급된 코드를 정확히 입력했는지 확인해주세요.');
                return;
            }

            // 인증 성공 시 다음 단계로 (중복 체크는 이미 코드 발급 전에 완료됨)
            onNext(bojId.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : '인증에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">BOJ 아이디 인증</h2>
                <p className="text-gray-600">백준 온라인 저지 아이디의 소유권을 인증합니다.</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="BOJ ID"
                    type="text"
                    value={bojId}
                    onChange={handleBojIdChange}
                    error={error || undefined}
                    placeholder="백준 온라인 저지 ID"
                    disabled={isLoading}
                />

                {code && (
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">발급된 인증 코드:</p>
                        <div className="flex items-center gap-3 mb-6">
                            <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 flex-1">{code}</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(code);
                                    toast.success('인증 코드가 복사되었습니다.');
                                }}
                                className="p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors"
                                title="코드 복사"
                            >
                                <Copy className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100">1.</span>
                                <span>위 인증 코드를 복사하세요. (복사 버튼 클릭 또는 직접 복사)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100">2.</span>
                                <span>
                                    백준 온라인 저지{' '}
                                    <a
                                        href="https://www.acmicpc.net/modify"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
                                    >
                                        프로필 수정 페이지
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    에 접속하세요.
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100">3.</span>
                                <span>
                                    프로필 수정 페이지에서 <strong>"상태 메시지"</strong> 필드에 위에서 복사한 인증 코드를 붙여넣으세요.
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100">4.</span>
                                <span>상태 메시지를 저장한 후, 아래 "인증 확인" 버튼을 클릭하세요.</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                            <strong>💡 참고:</strong> 인증 코드는 정확히 입력해야 합니다. 공백이나 오타가 있으면 인증에 실패합니다.
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

                {error && <div className="text-red-600 text-sm">{error}</div>}
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

