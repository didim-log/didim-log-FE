import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Calendar, ExternalLink, Trash2, Star } from 'lucide-react'
import Card from '../common/Card'
import { Button } from '../ui/Button'
import { retrospectiveApi } from '../../api/endpoints/retrospective.api'
import { toast } from 'sonner'
import { getErrorMessage } from '../../types/api/common.types'
import type { RetrospectiveResponse } from '../../types/api/retrospective.types'
import { formatKST } from '../../utils/dateUtils'

interface RetrospectiveCardProps {
    retrospective: RetrospectiveResponse
    onView: (problemId: string) => void
    onDelete: (retrospectiveId: string) => void
    onBookmarkChange?: (retrospectiveId: string, isBookmarked: boolean) => void
}

export default function RetrospectiveCard({
    retrospective,
    onView,
    onDelete,
    onBookmarkChange,
}: RetrospectiveCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(retrospective.isBookmarked)
    const [isToggling, setIsToggling] = useState(false)

    const handleToggleBookmark = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        setIsToggling(true)
        try {
            const response = await retrospectiveApi.toggleBookmark(retrospective.id)
            setIsBookmarked(response.isBookmarked)
            onBookmarkChange?.(retrospective.id, response.isBookmarked)
            toast.success(
                response.isBookmarked ? '북마크에 추가되었습니다.' : '북마크에서 제거되었습니다.'
            )
        } catch (err) {
            toast.error(getErrorMessage(err) || '북마크 토글에 실패했습니다.')
        } finally {
            setIsToggling(false)
        }
    }

    return (
        <Card hoverable className="cursor-pointer relative">
            {/* 북마크 버튼 - 우측 상단 */}
            <button
                onClick={handleToggleBookmark}
                disabled={isToggling}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                title={isBookmarked ? '북마크 제거' : '북마크 추가'}
            >
                <Star
                    className={`w-5 h-5 transition-colors ${
                        isBookmarked
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400'
                    }`}
                />
            </button>

            <div
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pr-10"
                onClick={() => onView(retrospective.problemId)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            문제 #{retrospective.problemId}
                        </h3>
                        {retrospective.mainCategory && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                {retrospective.mainCategory}
                            </span>
                        )}
                    </div>
                    {retrospective.summary ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {retrospective.summary}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">
                            요약이 없습니다.
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatKST(retrospective.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            onView(retrospective.problemId)
                        }}
                        className="flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        보기
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(retrospective.id)
                        }}
                        className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        삭제
                    </Button>
                </div>
            </div>
        </Card>
    )
}

