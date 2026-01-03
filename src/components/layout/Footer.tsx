/**
 * 푸터 컴포넌트 (저작권 및 면책 조항 포함)
 */

import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: FC = () => {
    const navigate = useNavigate();

    const handleFeedbackClick = () => {
        // 피드백은 관리자 페이지에서 관리하므로, 로그인한 사용자는 관리자 페이지로 이동
        // 또는 별도의 피드백 페이지로 이동할 수 있음
        navigate('/admin/dashboard');
    };

    return (
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4">
                    {/* 저작권 및 면책 조항 */}
                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            © 2026 DidimLog. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            DidimLog is a personal study tool not affiliated with Baekjoon Online Judge (BOJ) or solved.ac.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Problem data powered by BOJ. Tier data provided by solved.ac.
                        </p>
                    </div>

                    {/* 문의하기 버튼 (선택적) */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleFeedbackClick}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            문의하기
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

