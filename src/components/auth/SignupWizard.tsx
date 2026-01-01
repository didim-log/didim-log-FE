import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import Modal from '../common/Modal'
import { TERMS_DATA } from '../../constants/termsData'
import {
    issueBojVerificationCode,
    verifyBojOwnership,
    finalizeSignup,
    type BojCodeIssueResponse,
} from '../../apis/authApi'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../utils/errorHandler'

const BOJ_ID_PATTERN = /^[a-zA-Z0-9_]*$/

interface SignupWizardProps {
    email: string
    provider: string
    providerId: string
    onComplete: (token: string) => void
}

type WizardStep = 'terms' | 'boj' | 'nickname'

export default function SignupWizard({
    email,
    provider,
    providerId,
    onComplete,
}: SignupWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('terms')
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

    // Step 1: 약관 동의
    const [termsAgreed, setTermsAgreed] = useState(false)

    // Step 2: BOJ 인증
    const [bojId, setBojId] = useState('')
    const [verificationCode, setVerificationCode] = useState<BojCodeIssueResponse | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [isCodeIssuing, setIsCodeIssuing] = useState(false)

    // Step 3: 닉네임
    const [nickname, setNickname] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isValidBojId = bojId.trim().length > 0 && BOJ_ID_PATTERN.test(bojId.trim())
    const isValidNickname = nickname.trim().length >= 2 && nickname.trim().length <= 20

    const handleIssueCode = async () => {
        if (!isValidBojId) {
            toast.error('올바른 BOJ ID를 입력해주세요.')
            return
        }

        setIsCodeIssuing(true)
        try {
            const codeData = await issueBojVerificationCode()
            setVerificationCode(codeData)
            toast.success('인증 코드가 발급되었습니다. 백준 프로필 상태 메시지에 입력해주세요.')
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>
            toast.error(error.response?.data?.message || '인증 코드 발급에 실패했습니다.')
        } finally {
            setIsCodeIssuing(false)
        }
    }

    const handleVerify = async () => {
        if (!isValidBojId || !verificationCode) {
            toast.error('BOJ ID와 인증 코드를 확인해주세요.')
            return
        }

        setIsVerifying(true)
        try {
            const result = await verifyBojOwnership({
                sessionId: verificationCode.sessionId,
                bojId: bojId.trim(),
            })
            if (result.verified) {
                setIsVerified(true)
                toast.success('BOJ 계정 인증이 완료되었습니다!')
            } else {
                toast.error('인증에 실패했습니다. 상태 메시지를 확인해주세요.')
            }
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>
            toast.error(error.response?.data?.message || '인증에 실패했습니다.')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleCopyCode = () => {
        if (verificationCode) {
            navigator.clipboard.writeText(verificationCode.code)
            toast.success('인증 코드가 복사되었습니다.')
        }
    }

    const handleFinalSubmit = async () => {
        if (!isValidNickname) {
            toast.error('닉네임은 2자 이상 20자 이하여야 합니다.')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await finalizeSignup({
                email: email.trim(),
                provider,
                providerId,
                nickname: nickname.trim(),
                bojId: isVerified ? bojId.trim() : null,
                isAgreedToTerms: true,
            })
            if (response.token) {
                onComplete(response.token)
            }
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>
            const errorMessage =
                error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBojIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || BOJ_ID_PATTERN.test(value)) {
            setBojId(value)
            setIsVerified(false)
            setVerificationCode(null)
        }
    }

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value)
    }

    const stepIndicator = [
        { key: 'terms' as WizardStep, label: '약관 동의', number: 1 },
        { key: 'boj' as WizardStep, label: 'BOJ 인증', number: 2 },
        { key: 'nickname' as WizardStep, label: '닉네임 설정', number: 3 },
    ]

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {stepIndicator.map((step, index) => {
                        const isActive = currentStep === step.key
                        const isCompleted =
                            (step.key === 'terms' && termsAgreed) ||
                            (step.key === 'boj' && isVerified) ||
                            (step.key === 'nickname' && currentStep === 'nickname')
                        const stepIndex = stepIndicator.findIndex((s) => s.key === currentStep)

                        return (
                            <div key={step.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-blue-600 text-white'
                                                : isCompleted
                                                  ? 'bg-green-500 text-white'
                                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {isCompleted && !isActive ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <p
                                        className={`mt-2 text-xs font-medium ${
                                            isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                                {index < stepIndicator.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 transition-colors ${
                                            stepIndex > index
                                                ? 'bg-green-500'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card>
                {/* Step 1: 약관 동의 */}
                {currentStep === 'terms' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            약관 동의
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={termsAgreed}
                                    onChange={(e) => setTermsAgreed(e.target.checked)}
                                    className="mt-1 mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    <span className="text-red-500">*</span> 서비스 이용약관 및
                                    개인정보 처리방침에 동의합니다
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsTermsModalOpen(true)}
                                    className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    [전문 보기]
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => setCurrentStep('boj')}
                                disabled={!termsAgreed}
                            >
                                다음
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: BOJ 인증 */}
                {currentStep === 'boj' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            BOJ 계정 인증
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            백준 온라인 저지 계정 소유권을 확인합니다.
                        </p>

                        <div className="space-y-4">
                            <Input
                                label="BOJ ID"
                                type="text"
                                value={bojId}
                                onChange={handleBojIdChange}
                                placeholder="백준 온라인 저지 ID를 입력하세요"
                                helperText="영문, 숫자, 언더스코어(_)만 사용 가능합니다"
                                disabled={isVerified}
                            />

                            {!verificationCode && (
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleIssueCode}
                                    disabled={!isValidBojId || isCodeIssuing}
                                    isLoading={isCodeIssuing}
                                >
                                    인증 코드 발급
                                </Button>
                            )}

                            {verificationCode && !isVerified && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                인증 코드
                                            </h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                아래 코드를 백준 프로필 상태 메시지에 입력해주세요.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                                            title="코드 복사"
                                        >
                                            <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </button>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-300 dark:border-blue-700">
                                        <code className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                                            {verificationCode.code}
                                        </code>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                        <ExternalLink className="w-3 h-3" />
                                        <a
                                            href="https://www.acmicpc.net/user/setting"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            백준 프로필 설정 페이지로 이동
                                        </a>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        유효 시간: {Math.floor(verificationCode.expiresInSeconds / 60)}분
                                    </p>
                                </div>
                            )}

                            {verificationCode && !isVerified && (
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleVerify}
                                    disabled={!isValidBojId || isVerifying}
                                    isLoading={isVerifying}
                                >
                                    인증 확인
                                </Button>
                            )}

                            {isVerified && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                        <Check className="w-5 h-5" />
                                        <span className="font-semibold">인증 완료</span>
                                    </div>
                                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                                        BOJ 계정 인증이 완료되었습니다.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setCurrentStep('terms')}
                                >
                                    이전
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => setCurrentStep('nickname')}
                                    disabled={!isVerified}
                                >
                                    {isVerified ? '다음' : '인증 후 진행'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: 닉네임 설정 */}
                {currentStep === 'nickname' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            닉네임 설정
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            사용할 닉네임을 입력해주세요. (2-20자)
                        </p>

                        <Input
                            label="닉네임"
                            type="text"
                            value={nickname}
                            onChange={handleNicknameChange}
                            placeholder="닉네임을 입력하세요 (2-20자)"
                            helperText={
                                nickname && !isValidNickname
                                    ? '닉네임은 2자 이상 20자 이하여야 합니다'
                                    : undefined
                            }
                            maxLength={20}
                            autoFocus
                        />

                        {isVerified && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold">인증된 BOJ ID:</span> {bojId}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setCurrentStep('boj')}
                            >
                                이전
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleFinalSubmit}
                                disabled={!isValidNickname || isSubmitting}
                                isLoading={isSubmitting}
                            >
                                회원가입 완료
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* 약관 모달 */}
            <Modal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                title="약관 전문"
                className="max-w-2xl"
                footer={
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setIsTermsModalOpen(false)}
                    >
                        닫기
                    </Button>
                }
            >
                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-200">
                    <section>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {TERMS_DATA.service.title}
                        </h3>
                        <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-700 dark:text-gray-200">
                            {TERMS_DATA.service.content}
                        </pre>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {TERMS_DATA.privacy.title}
                        </h3>
                        <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-700 dark:text-gray-200">
                            {TERMS_DATA.privacy.content}
                        </pre>
                    </section>
                </div>
            </Modal>
        </div>
    )
}
