/**
 * 결과 표시 컴포넌트
 */

import type { FC, MouseEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import type { SolutionSubmitResponse } from '../../../types/api/study.types';
import { X } from 'lucide-react';

interface ResultDisplayProps {
    result: SolutionSubmitResponse | null;
    isSuccess: boolean;
    onWriteRetrospective: () => void;
    onClose: () => void;
}

export const ResultDisplay: FC<ResultDisplayProps> = ({ result, isSuccess, onWriteRetrospective, onClose }) => {
    if (!result) {
        return null;
    }

    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        // 모달 내부 클릭은 무시
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 relative">
                {/* X 닫기 버튼 (우측 상단) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="닫기"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    {isSuccess ? (
                        <div className="mb-4">
                            <svg
                                className="w-16 h-16 mx-auto text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-4">성공!</h2>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <svg
                                className="w-16 h-16 mx-auto text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-4">실패</h2>
                        </div>
                    )}

                    <p className="text-gray-600 dark:text-gray-400 mb-2">{result.message}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        현재 티어: {result.currentTier} (레벨 {result.currentTierLevel})
                    </p>
                </div>

                {/* 단일 Primary 버튼 - 회고 작성하러 가기 */}
                <div className="pt-2">
                    <Button 
                        onClick={onWriteRetrospective} 
                        variant="primary" 
                        className="w-full"
                        size="lg"
                    >
                        회고 작성하러 가기
                    </Button>
                </div>
            </div>
        </div>
    );
};
