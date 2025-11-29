import { useNavigate } from 'react-router-dom'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { CheckCircle, XCircle } from 'lucide-react'

interface ResultModalProps {
    isOpen: boolean
    onClose: () => void
    isSuccess: boolean
    timeTaken: number
}

export default function ResultModal({
    isOpen,
    onClose,
    isSuccess,
    timeTaken,
}: ResultModalProps) {
    const navigate = useNavigate()

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    const handleGoToDashboard = () => {
        navigate('/dashboard')
    }

    const handleRetry = () => {
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isSuccess ? '축하합니다!' : '아쉽네요'}
        >
            <div className="text-center">
                {isSuccess ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <p className="text-lg text-gray-700 mb-2">
                    {isSuccess
                        ? '문제를 성공적으로 해결했습니다!'
                        : '정답이 아닙니다. 다시 시도해보세요.'}
                </p>
                {isSuccess && (
                    <p className="text-sm text-gray-500 mb-4">
                        소요 시간: {formatTime(timeTaken)}
                    </p>
                )}
            </div>
            <div className="flex justify-center gap-2 mt-6">
                {isSuccess ? (
                    <Button
                        variant="primary"
                        onClick={handleGoToDashboard}
                        fullWidth
                    >
                        대시보드로 이동
                    </Button>
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
        </Modal>
    )
}

