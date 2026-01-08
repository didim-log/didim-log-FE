/**
 * 문제 가리기 컴포넌트
 */

import type { FC } from 'react';

interface ProblemBlurProps {
    isBlurred: boolean;
    onStart: () => void;
}

export const ProblemBlur: FC<ProblemBlurProps> = ({ isBlurred, onStart }) => {
    if (!isBlurred) {
        return null;
    }

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gray-900/80 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 p-8">
                    <div className="text-white dark:text-gray-100">
                        <svg
                            className="w-16 h-16 mx-auto mb-4 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold mb-2">문제를 풀 준비가 되셨나요?</h3>
                        <p className="text-gray-300 dark:text-gray-400 mb-6">
                            문제를 보려면 아래 버튼을 클릭하세요.
                            <br />
                            버튼을 누르면 타이머가 시작됩니다.
                        </p>
                    </div>
                    <button
                        onClick={onStart}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                    >
                        문제 풀기 시작
                    </button>
                </div>
            </div>
        </div>
    );
};
