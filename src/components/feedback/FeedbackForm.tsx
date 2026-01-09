import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import type { FeedbackType } from '../../types/api/feedback.types'
import { useCreateFeedback } from '../../hooks/api/useFeedback'
import { getErrorMessage } from '../../types/api/common.types'

interface FeedbackFormProps {
    onSuccess?: () => void
}

const MIN_CONTENT_LENGTH = 10

export default function FeedbackForm({ onSuccess }: FeedbackFormProps) {
    const [type, setType] = useState<FeedbackType>('BUG')
    const [content, setContent] = useState('')
    const createFeedbackMutation = useCreateFeedback()

    const trimmedContent = content.trim()
    const isValid = useMemo(() => {
        return trimmedContent.length >= MIN_CONTENT_LENGTH
    }, [trimmedContent])

    const helperText = useMemo(() => {
        if (content.length === 0) {
            return `최소 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.`
        }
        if (trimmedContent.length === 0) {
            return '공백만 입력할 수 없습니다.'
        }
        if (trimmedContent.length < MIN_CONTENT_LENGTH) {
            return `내용이 너무 짧습니다. (${trimmedContent.length}/${MIN_CONTENT_LENGTH})`
        }
        return undefined
    }, [content.length, trimmedContent])

    const handleSubmit = async () => {
        if (!isValid) {
            toast.error('피드백 내용은 10자 이상 입력해주세요.')
            return
        }

        try {
            await createFeedbackMutation.mutateAsync({
                type,
                content: trimmedContent,
            })
            toast.success('피드백이 등록되었습니다. 감사합니다!')
            setContent('')
            setType('BUG')
            if (onSuccess) {
                onSuccess()
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err)
            toast.error(errorMessage)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    유형
                </label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                    <option value="BUG">버그 리포트</option>
                    <option value="SUGGESTION">개선/건의</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="최소 10자 이상 작성해주세요."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
                />
                {helperText && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!isValid || createFeedbackMutation.isPending}
                    isLoading={createFeedbackMutation.isPending}
                >
                    등록
                </Button>
            </div>
        </div>
    )
}
