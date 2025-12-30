/**
 * 푸터 컴포넌트
 */

import React, { useState } from 'react';
import FeedbackForm from '../feedback/FeedbackForm';

export const Footer: React.FC = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    return (
        <>
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
                                onClick={() => setShowFeedbackModal(true)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                문의하기
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* 피드백 모달 */}
            {showFeedbackModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowFeedbackModal(false);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">문의하기</h2>
                                <button
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            <FeedbackForm onSuccess={() => setShowFeedbackModal(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

