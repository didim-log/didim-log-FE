import { useState } from 'react'
import { Bell, Trash2 } from 'lucide-react'
import Card from '../common/Card'
import Input from '../common/Input'
import { Button } from '../ui/Button'
import { updateProfile } from '../../apis/authApi'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../types/api/error'
import { getErrorMessage, type ApiErrorResponse } from '../../utils/errorHandler'

interface SettingsTabProps {
    currentNickname: string
    onSuccess?: () => void
}

/**
 * 닉네임 유효성 검사 함수
 * - 허용 문자: 완성된 한글(가-힣), 영문 대소문자(a-zA-Z), 숫자(0-9)
 * - 차단 문자: 자음/모음 낱자(ㄱ-ㅎ, ㅏ-ㅣ), 공백, 특수문자
 * - 길이 제한: 2자 이상 20자 이하
 */
function validateNickname(nickname: string): { isValid: boolean; error?: string } {
    const trimmed = nickname.trim()

    if (trimmed.length === 0) {
        return { isValid: false, error: '닉네임을 입력해주세요.' }
    }

    if (trimmed.length < 2 || trimmed.length > 20) {
        return {
            isValid: false,
            error: '닉네임은 2자 이상 20자 이하여야 합니다.',
        }
    }

    // 허용 문자: 완성된 한글(가-힣), 영문 대소문자(a-zA-Z), 숫자(0-9)
    const allowedPattern = /^[가-힣a-zA-Z0-9]+$/

    // 차단 문자: 자음/모음 낱자(ㄱ-ㅎ, ㅏ-ㅣ), 공백, 특수문자
    const hasJamo = /[ㄱ-ㅎㅏ-ㅣ]/.test(trimmed)
    const hasSpace = /\s/.test(nickname) // trim 전 원본에서 공백 체크
    const hasSpecialChar = /[^가-힣a-zA-Z0-9]/.test(trimmed)

    if (hasJamo) {
        return {
            isValid: false,
            error: '한글, 영문, 숫자만 사용할 수 있습니다 (자음/모음 불가)',
        }
    }

    if (hasSpace) {
        return {
            isValid: false,
            error: '공백을 사용할 수 없습니다.',
        }
    }

    if (hasSpecialChar || !allowedPattern.test(trimmed)) {
        return {
            isValid: false,
            error: '한글, 영문, 숫자만 사용할 수 있습니다 (특수문자 불가)',
        }
    }

    return { isValid: true }
}

/**
 * 비밀번호 유효성 검사 함수
 * - 영문, 숫자, 특수문자 중 3종류 이상 조합: 최소 8자리 이상
 * - 영문, 숫자, 특수문자 중 2종류 이상 조합: 최소 10자리 이상
 * - 공백 포함 불가
 */
function validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length === 0) {
        return { isValid: false, error: '비밀번호를 입력해주세요.' }
    }

    if (password.includes(' ')) {
        return { isValid: false, error: '비밀번호에 공백을 포함할 수 없습니다.' }
    }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9\s]/.test(password)

    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length

    if (typeCount >= 3) {
        if (password.length < 8) {
            return {
                isValid: false,
                error: '영문, 숫자, 특수문자 3종류 이상 조합 시 최소 8자리 이상이어야 합니다.',
            }
        }
    } else if (typeCount >= 2) {
        if (password.length < 10) {
            return {
                isValid: false,
                error: '영문, 숫자, 특수문자 중 2종류 이상 조합 시 최소 10자리 이상이어야 합니다.',
            }
        }
    } else {
        return {
            isValid: false,
            error: '영문, 숫자, 특수문자 중 최소 2종류 이상을 조합해야 합니다.',
        }
    }

    return { isValid: true }
}

export default function SettingsTab({ currentNickname, onSuccess }: SettingsTabProps) {
    const [nickname, setNickname] = useState(currentNickname)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [nicknameError, setNicknameError] = useState<string | undefined>()
    const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>()
    const [newPasswordError, setNewPasswordError] = useState<string | undefined>()
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>()

    const validateForm = (): boolean => {
        let isValid = true

        // 닉네임 검증
        const nicknameValidation = validateNickname(nickname)
        if (!nicknameValidation.isValid) {
            setNicknameError(nicknameValidation.error)
            isValid = false
        } else {
            setNicknameError(undefined)
        }

        // 비밀번호 변경 시 검증
        const isChangingPassword = newPassword.length > 0 || confirmPassword.length > 0

        if (isChangingPassword) {
            // 현재 비밀번호 검증
            if (currentPassword.length === 0) {
                setCurrentPasswordError('현재 비밀번호를 입력해주세요.')
                isValid = false
            } else {
                setCurrentPasswordError(undefined)
            }

            // 새 비밀번호 검증
            const passwordValidation = validatePassword(newPassword)
            if (!passwordValidation.isValid) {
                setNewPasswordError(passwordValidation.error)
                isValid = false
            } else {
                setNewPasswordError(undefined)
            }

            // 비밀번호 확인 검증
            if (confirmPassword.length === 0) {
                setConfirmPasswordError('비밀번호 확인을 입력해주세요.')
                isValid = false
            } else if (newPassword !== confirmPassword) {
                setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
                isValid = false
            } else {
                setConfirmPasswordError(undefined)
            }
        } else {
            setCurrentPasswordError(undefined)
            setNewPasswordError(undefined)
            setConfirmPasswordError(undefined)
        }

        return isValid
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            const request: {
                nickname?: string
                currentPassword?: string
                newPassword?: string
            } = {}

            // 닉네임이 변경되었으면 포함
            if (nickname.trim() !== currentNickname) {
                request.nickname = nickname.trim()
            }

            // 비밀번호가 변경되었으면 포함
            if (newPassword.length > 0) {
                request.currentPassword = currentPassword
                request.newPassword = newPassword
            }

            await updateProfile(request)
            toast.success('프로필이 성공적으로 수정되었습니다.')
            if (onSuccess) {
                onSuccess()
            }
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>
            const errorMessage = error.response?.data
                ? getErrorMessage(error.response.data)
                : '프로필 수정에 실패했습니다.'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFormValid = () => {
        const nicknameValidation = validateNickname(nickname)
        const nicknameValid = nicknameValidation.isValid

        const isChangingPassword = newPassword.length > 0 || confirmPassword.length > 0
        const passwordValid = isChangingPassword
            ? currentPassword.length > 0 &&
              validatePassword(newPassword).isValid &&
              newPassword === confirmPassword
            : true

        return nicknameValid && passwordValid
    }

    return (
        <div className="space-y-6">
            {/* 계정 설정 섹션 */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    계정 설정
                </h2>

                <div className="space-y-6">
                    {/* 닉네임 변경 */}
                    <div>
                        <Input
                            label="닉네임"
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                const newValue = e.target.value
                                setNickname(newValue)
                                // 실시간 유효성 검사
                                const validation = validateNickname(newValue)
                                if (validation.isValid) {
                                    setNicknameError(undefined)
                                } else {
                                    setNicknameError(validation.error)
                                }
                            }}
                            error={nicknameError}
                            placeholder="한글, 영문, 숫자만 사용 가능 (2-20자)"
                            maxLength={20}
                        />
                    </div>

                    {/* 비밀번호 변경 섹션 */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            비밀번호 변경 (선택사항)
                        </h3>

                        <div className="space-y-4">
                            <Input
                                label="현재 비밀번호"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value)
                                    setCurrentPasswordError(undefined)
                                }}
                                error={currentPasswordError}
                                placeholder="비밀번호 변경 시 필수"
                            />

                            <Input
                                label="새 비밀번호"
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value)
                                    setNewPasswordError(undefined)
                                    setConfirmPasswordError(undefined)
                                }}
                                error={newPasswordError}
                                helperText="영문, 숫자, 특수문자 중 3종류 이상 조합 시 8자 이상, 2종류 이상 조합 시 10자 이상"
                                placeholder="8자 이상"
                            />

                            <Input
                                label="새 비밀번호 확인"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    setConfirmPasswordError(undefined)
                                }}
                                error={confirmPasswordError}
                                placeholder="새 비밀번호와 동일하게 입력"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!isFormValid() || isSubmitting}
                            isLoading={isSubmitting}
                        >
                            저장
                        </Button>
                    </div>
                </div>
            </Card>

            {/* 알림 설정 섹션 (비활성화) */}
            <Card className="opacity-60 grayscale">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            알림 설정
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            알림 설정 기능은 준비 중입니다.
                        </p>
                    </div>
                </div>
            </Card>

            {/* 계정 탈퇴 섹션 (비활성화) */}
            <Card className="opacity-60 grayscale">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Trash2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            계정 탈퇴
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            계정 탈퇴 기능은 준비 중입니다.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}






