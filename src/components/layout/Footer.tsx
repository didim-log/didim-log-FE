/**
 * 푸터 컴포넌트
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
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* 좌측: 저작권 정보 */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        © 2025 DidimLog. All rights reserved.
                    </div>

                    {/* 우측: 문의하기 버튼 */}
                    <div className="flex flex-wrap gap-6 text-sm">
                        <button
                            onClick={handleFeedbackClick}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            문의하기
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

