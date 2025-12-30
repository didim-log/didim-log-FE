/**
 * 코드 명언 위젯 컴포넌트
 */

import type { QuoteResponse } from '../../../types/api/quote.types';

interface QuoteCardProps {
    quote: QuoteResponse | null;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
    // quote가 없으면 렌더링하지 않음 (저자는 Unknown이어도 표시)
    if (!quote) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-md p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
                {/* 인용구 아이콘 - 원형 배경 */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed mb-2">
                        "{quote.content}"
                    </p>
                    {quote.author && quote.author.toLowerCase() !== 'unknown' && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs text-right">
                            — {quote.author}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
