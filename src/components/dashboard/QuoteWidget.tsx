import { useState } from 'react'
import { RefreshCw, Quote as QuoteIcon } from 'lucide-react'
import Card from '../common/Card'
import { Button } from '../ui/Button'
import type { QuoteResponse } from '../../types/api/dtos'

interface QuoteWidgetProps {
    quote: QuoteResponse | null
    onRefresh?: () => void
}

// Mock Data (API 연동 전까지 사용)
const MOCK_QUOTES: QuoteResponse[] = [
    {
        id: 'mock-1',
        content: '코딩은 90%의 디버깅과 10%의 버그 생성으로 이루어진다.',
        author: 'Anonymous',
    },
    {
        id: 'mock-2',
        content: '프로그래밍은 생각을 코드로 표현하는 예술이다.',
        author: 'Anonymous',
    },
    {
        id: 'mock-3',
        content: '좋은 코드는 읽기 쉬운 코드다.',
        author: 'Martin Fowler',
    },
    {
        id: 'mock-4',
        content: '실패는 성공의 어머니다. 실패에서 배우고 계속 나아가라.',
        author: 'Anonymous',
    },
    {
        id: 'mock-5',
        content: '완벽한 코드를 작성하는 것보다 읽기 쉬운 코드를 작성하는 것이 더 중요하다.',
        author: 'Anonymous',
    },
]

export default function QuoteWidget({ quote, onRefresh }: QuoteWidgetProps) {
    const [mockQuote, setMockQuote] = useState<QuoteResponse>(
        quote || MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)]
    )

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh()
        } else {
            // Mock Data 새로고침
            const randomQuote =
                MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)]
            setMockQuote(randomQuote)
        }
    }

    const displayQuote = quote || mockQuote

    if (!displayQuote) {
        return null
    }

    return (
        <Card className="relative">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                    <QuoteIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            오늘의 명언
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            className="p-1 h-auto"
                            title="새로운 명언 보기"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                        </Button>
                    </div>
                    <p className="text-base text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
                        "{displayQuote.content}"
                    </p>
                    {displayQuote.author && 
                     displayQuote.author.toLowerCase() !== 'unknown' && 
                     displayQuote.author.toLowerCase() !== 'anonymous' && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            — {displayQuote.author}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    )
}

