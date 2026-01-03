/**
 * 푸터 컴포넌트 (개발자 정보 및 저작권 포함)
 */

import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, BookOpen, Mail } from 'lucide-react';

export const Footer: FC = () => {
    const navigate = useNavigate();

    const handleFeedbackClick = () => {
        // 피드백은 관리자 페이지에서 관리하므로, 로그인한 사용자는 관리자 페이지로 이동
        navigate('/admin/dashboard');
    };

    return (
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* 왼쪽: 저작권 및 면책 조항 */}
                    <div className="text-center md:text-left">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            © 2025 DidimLog. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            DidimLog is a personal study tool not affiliated with Baekjoon Online Judge (BOJ) or solved.ac.
                            <br />
                            Problem data powered by BOJ. Tier data provided by solved.ac.
                        </p>
                    </div>

                    {/* 오른쪽: 개발자 정보 및 링크 */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/stdiodh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                aria-label="GitHub"
                                title="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="https://velog.io/@stdiodh/posts"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                aria-label="Velog Blog"
                                title="Velog Blog"
                            >
                                <BookOpen className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:playlistdh@gmail.com"
                                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                aria-label="Email"
                                title="Email"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
                        <button
                            onClick={handleFeedbackClick}
                            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            문의하기
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

