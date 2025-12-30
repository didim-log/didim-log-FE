/**
 * 결과 표시 컴포넌트
 */

import { Button } from '../../../components/ui/Button';
import type { SolutionSubmitResponse } from '../../../types/api/study.types';

interface ResultDisplayProps {
    result: SolutionSubmitResponse | null;
    isSuccess: boolean;
    onWriteRetrospective: () => void;
    onClose: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isSuccess, onWriteRetrospective, onClose }) => {
    if (!result) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
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

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="outline" className="flex-1">
                        닫기
                    </Button>
                    <Button onClick={onWriteRetrospective} variant="primary" className="flex-1">
                        회고 작성하기
                    </Button>
                </div>
            </div>
        </div>
    );
};

