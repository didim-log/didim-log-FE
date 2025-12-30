/**
 * 프로필 수정 폼 컴포넌트
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validation } from '../../../utils/validation';
import { useAuthStore } from '../../../stores/auth.store';
import type { UpdateProfileRequest } from '../../../types/api/student.types';

interface ProfileEditFormProps {
    initialNickname: string;
    initialPrimaryLanguage?: string | null;
    bojId?: string;
    onSubmit: (data: UpdateProfileRequest) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    error: Error | null;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
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
    }, [initialNickname, initialPrimaryLanguage]);
    const [errors, setErrors] = useState<{
        nickname?: string;
        currentPassword?: string;
        newPassword?: string;
    }>({});

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
        } catch (err) {
            console.error('Profile update failed:', err);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">프로필 수정</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="닉네임"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    error={errors.nickname}
                    placeholder="닉네임을 입력하세요 (한글, 영문, 숫자만 가능)"
                />

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
                        <option value="JAVA">Java</option>
                        <option value="PYTHON">Python</option>
                        <option value="KOTLIN">Kotlin</option>
                        <option value="JAVASCRIPT">JavaScript</option>
                        <option value="CPP">C++</option>
                        <option value="GO">Go</option>
                        <option value="RUST">Rust</option>
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
                        disabled={!!errors.nickname || !!errors.currentPassword || !!errors.newPassword}
                    >
                        저장
                    </Button>
                </div>
            </form>
        </div>
    );
};

