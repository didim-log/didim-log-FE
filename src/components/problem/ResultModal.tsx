import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { fireConfetti } from '../../utils/confetti'

interface ResultModalProps {
    isOpen: boolean
    onClose: () => void
    isSuccess: boolean
    timeTaken: number
    problemId?: string
}

export default function ResultModal({
    isOpen,
    onClose,
    isSuccess,
    timeTaken,
    problemId,
}: ResultModalProps) {
    const navigate = useNavigate()

    useEffect(() => {
        if (!isOpen) {
            return
        }

        if (isSuccess) {
            fireConfetti()
        }
    }, [isOpen, isSuccess])

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    const handleGoToDashboard = () => {
        navigate('/dashboard')
    }

    const handleWriteRetrospective = () => {
        if (problemId) {
            navigate(`/retrospectives/new/${problemId}`)
        }
    }

    const handleRetry = () => {
        onClose()
    }

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div
                className={`relative z-50 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 ${
                    !isSuccess ? 'animate-shake' : ''
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isSuccess ? '축하합니다!' : '아쉽네요'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="text-center">
                    {isSuccess ? (
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    ) : (
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    )}
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                        {isSuccess
                            ? '문제를 성공적으로 해결했습니다!'
                            : '정답이 아닙니다. 다시 시도해보세요.'}
                    </p>
                    {isSuccess && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            소요 시간: {formatTime(timeTaken)}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-6">
                    {isSuccess ? (
                        <>
                            <Button
                                variant="primary"
                                onClick={handleWriteRetrospective}
                                fullWidth
                            >
                                회고 작성하기
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleGoToDashboard}
                                fullWidth
                            >
                                메인으로
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleRetry}
                            fullWidth
                        >
                            다시 풀기
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

