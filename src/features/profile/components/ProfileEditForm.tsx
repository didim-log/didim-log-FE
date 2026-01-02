/**
 * 프로필 수정 폼 컴포넌트
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validation } from '../../../utils/validation';
import { useAuthStore } from '../../../stores/auth.store';
import { useCheckNickname } from '../../../hooks/api/useMember';
import type { UpdateProfileRequest } from '../../../types/api/student.types';
import { Check, X } from 'lucide-react';

interface ProfileEditFormProps {
    initialNickname: string;
    initialPrimaryLanguage?: string | null;
    bojId?: string;
    onSubmit: (data: UpdateProfileRequest) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    error: Error | null;
}

export const ProfileEditForm: FC<ProfileEditFormProps> = ({
    initialNickname,
    initialPrimaryLanguage,
    bojId,
    onSubmit,
    onCancel,
    isLoading,
    error,
}) => {
    const [nickname, setNickname] = useState(initialNickname);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    // primaryLanguage는 null이거나 undefined일 수 있으므로 빈 문자열로 변환
    const [primaryLanguage, setPrimaryLanguage] = useState<string>(
        initialPrimaryLanguage ? initialPrimaryLanguage.toUpperCase() : ''
    );

    // 초기값이 변경되면 상태 업데이트
    useEffect(() => {
        setNickname(initialNickname);
        // primaryLanguage는 대문자로 정규화하여 저장
        setPrimaryLanguage(initialPrimaryLanguage ? initialPrimaryLanguage.toUpperCase() : '');
        // 닉네임이 초기값으로 돌아가면 중복 검사 상태 초기화
        if (nickname === initialNickname) {
            setNicknameChecked(null);
        }
    }, [initialNickname, initialPrimaryLanguage]);
    
    // 닉네임이 변경되면 중복 검사 상태 초기화
    useEffect(() => {
        if (nickname !== initialNickname) {
            setNicknameChecked(null);
        }
    }, [nickname, initialNickname]);
    const [errors, setErrors] = useState<{
        nickname?: string;
        currentPassword?: string;
        newPassword?: string;
    }>({});
    const [nicknameChecked, setNicknameChecked] = useState<boolean | null>(null); // null: 미확인, true: 사용 가능, false: 중복
    const checkNicknameMutation = useCheckNickname();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const updateData: UpdateProfileRequest = {};

        // 닉네임 유효성 검사
        if (nickname.trim() && nickname.trim() !== initialNickname) {
            const nicknameValidation = validation.isValidNickname(nickname.trim());
            if (!nicknameValidation.valid) {
                setErrors({ nickname: nicknameValidation.message || '닉네임이 유효하지 않습니다.' });
                return;
            }

            // 닉네임 중복 검사가 완료되지 않은 경우
            if (nicknameChecked !== true) {
                setErrors({ nickname: '닉네임 중복 검사를 먼저 진행해주세요.' });
                return;
            }
            
            updateData.nickname = nickname.trim();
        }

        // 비밀번호 변경
        if (newPassword.trim()) {
            if (!currentPassword.trim()) {
                setErrors({ currentPassword: '비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.' });
                return;
            }

            const passwordValidation = validation.isValidPassword(newPassword);
            if (!passwordValidation.valid) {
                setErrors({ newPassword: passwordValidation.message });
                return;
            }

            updateData.currentPassword = currentPassword;
            updateData.newPassword = newPassword;
        }

        // 주 언어 처리: 빈 문자열이면 null로, 값이 있으면 대문자로 변환
        const normalizedPrimaryLanguage = primaryLanguage.trim() === '' ? null : (primaryLanguage.toUpperCase() as any);
        const normalizedInitialLanguage = initialPrimaryLanguage 
            ? (initialPrimaryLanguage.trim() === '' ? null : initialPrimaryLanguage.toUpperCase())
            : null;
        
        // 주 언어가 변경된 경우에만 업데이트
        // null로 명시적으로 설정하는 경우도 업데이트에 포함
        if (normalizedPrimaryLanguage !== normalizedInitialLanguage) {
            updateData.primaryLanguage = normalizedPrimaryLanguage;
        }

        if (Object.keys(updateData).length === 0) {
            onCancel();
            return;
        }

        try {
            await onSubmit(updateData);
            // updateProfile API는 204 No Content이므로, 성공 시 클라이언트에서 user를 강제 갱신한다.
            const authState = useAuthStore.getState();
            const currentUser = authState.user;
            if (currentUser) {
                const nextUser = {
                    ...currentUser,
                    ...(updateData.nickname ? { nickname: updateData.nickname } : {}),
                    ...(updateData.primaryLanguage !== undefined ? { primaryLanguage: updateData.primaryLanguage } : {}),
                };
                authState.setUser(nextUser);
            }
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            console.error('Profile update failed:', err);
            const errorCode = err?.response?.data?.code;
            const errorMessage = err?.response?.data?.message || '';
            
            // 백엔드에서 닉네임 중복 에러 처리
            if (errorCode === 'DUPLICATE_NICKNAME' || errorMessage.includes('이미 사용 중인 닉네임')) {
                setErrors({ nickname: '이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.' });
                return;
            }
            
            // 비밀번호 관련 에러 처리 - 순서 중요: 현재 비밀번호 검증이 먼저 수행됨
            if (errorCode === 'PASSWORD_MISMATCH' || errorMessage.includes('현재 비밀번호가 일치하지 않습니다')) {
                setErrors({ 
                    currentPassword: '현재 비밀번호가 일치하지 않습니다.',
                    newPassword: '' // 새 비밀번호 에러 초기화
                });
                return;
            }
            
            // 새 비밀번호가 현재 비밀번호와 같은 경우
            if (errorMessage.includes('새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다') ||
                errorMessage.includes('현재 비밀번호와 다르게')) {
                setErrors({ 
                    newPassword: '새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.',
                    currentPassword: '' // 현재 비밀번호 에러 초기화
                });
                return;
            }
            
            // 새 비밀번호 정책 위반 에러 처리
            if (errorCode === 'INVALID_PASSWORD' || errorMessage.includes('비밀번호 정책') || 
                errorMessage.includes('영문') || errorMessage.includes('숫자') || 
                errorMessage.includes('특수문자') || errorMessage.includes('공백')) {
                setErrors({ 
                    newPassword: errorMessage || '비밀번호 정책에 위배됩니다.',
                    currentPassword: '' // 현재 비밀번호 에러 초기화
                });
                return;
            }
            
            // 기타 에러는 상위 컴포넌트에서 처리
            throw err;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">프로필 수정</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        닉네임
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                error={undefined} // 에러는 하단에서 수동으로 표시
                                placeholder="닉네임을 입력하세요 (한글, 영문, 숫자만 가능)"
                                label="" // label은 상위 div에서 처리
                                className={errors.nickname ? 'border-red-500' : ''}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                if (!nickname.trim()) {
                                    setErrors({ nickname: '닉네임을 입력해주세요.' });
                                    return;
                                }
                                
                                // 초기 닉네임과 동일한 경우 중복 검사 불필요
                                if (nickname.trim() === initialNickname) {
                                    setNicknameChecked(true);
                                    setErrors({});
                                    return;
                                }
                                
                                const nicknameValidation = validation.isValidNickname(nickname.trim());
                                if (!nicknameValidation.valid) {
                                    setErrors({ nickname: nicknameValidation.message || '닉네임이 유효하지 않습니다.' });
                                    setNicknameChecked(false);
                                    return;
                                }
                                
                                try {
                                    setErrors({});
                                    const isAvailable = await checkNicknameMutation.mutateAsync(nickname.trim());
                                    if (isAvailable) {
                                        setNicknameChecked(true);
                                        setErrors({});
                                    } else {
                                        setNicknameChecked(false);
                                        setErrors({ nickname: '이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.' });
                                    }
                                } catch (err: any) {
                                    console.error('Nickname check failed:', err);
                                    setNicknameChecked(false);
                                    setErrors({ nickname: '닉네임을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.' });
                                }
                            }}
                            disabled={checkNicknameMutation.isPending || nickname.trim() === initialNickname}
                            className="whitespace-nowrap"
                        >
                            {checkNicknameMutation.isPending ? '확인 중...' : '중복 확인'}
                        </Button>
                    </div>
                    {/* 중복 확인 결과 또는 에러 메시지 표시 (하나만 표시) */}
                    {nickname.trim() && nickname.trim() !== initialNickname && nicknameChecked !== null && !errors.nickname ? (
                        <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                            {nicknameChecked ? (
                                <>
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-green-600 dark:text-green-400">사용 가능한 닉네임입니다.</span>
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="text-red-600 dark:text-red-400">이미 사용 중인 닉네임입니다.</span>
                                </>
                            )}
                        </div>
                    ) : errors.nickname ? (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nickname}</p>
                    ) : null}
                </div>

                {/* BOJ ID (읽기 전용) */}
                {bojId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            BOJ ID
                        </label>
                        <input
                            type="text"
                            value={bojId}
                            disabled
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            BOJ ID는 수정할 수 없습니다.
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        주 언어
                    </label>
                    <select
                        value={primaryLanguage}
                        onChange={(e) => setPrimaryLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">선택하지 않음</option>
                        <option value="C">C</option>
                        <option value="CPP">C++</option>
                        <option value="CSHARP">C#</option>
                        <option value="GO">Go</option>
                        <option value="JAVA">Java</option>
                        <option value="JAVASCRIPT">JavaScript</option>
                        <option value="KOTLIN">Kotlin</option>
                        <option value="PYTHON">Python</option>
                        <option value="R">R</option>
                        <option value="RUBY">Ruby</option>
                        <option value="SCALA">Scala</option>
                        <option value="SWIFT">Swift</option>
                        <option value="TEXT">Text</option>
                    </select>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">비밀번호 변경</h3>
                    <Input
                        label="현재 비밀번호"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        error={errors.currentPassword}
                        placeholder="현재 비밀번호를 입력하세요"
                    />
                    <Input
                        label="새 비밀번호"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={errors.newPassword}
                        placeholder="새 비밀번호를 입력하세요"
                    />
                </div>

                {error && (
                    <div className="text-red-600 dark:text-red-400 text-sm">
                        {error instanceof Error ? error.message : '프로필 수정에 실패했습니다.'}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onCancel} variant="outline">
                        취소
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        isLoading={isLoading}
                        disabled={
                            !!errors.nickname || 
                            !!errors.currentPassword || 
                            !!errors.newPassword ||
                            (nickname.trim() !== '' && nickname.trim() !== initialNickname && nicknameChecked !== true)
                        }
                    >
                        저장
                    </Button>
                </div>
            </form>
        </div>
    );
};

