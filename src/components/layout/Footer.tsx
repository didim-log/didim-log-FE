/**
 * 푸터 컴포넌트 (개발자 정보 및 저작권 포함)
 */

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, BookOpen, Mail, User, ChevronDown, ChevronUp } from 'lucide-react';

export const Footer: FC = () => {
    const navigate = useNavigate();
    const [isDeveloperMenuOpen, setIsDeveloperMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleFeedbackClick = () => {
        navigate('/admin/dashboard');
    };

    // 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsDeveloperMenuOpen(false);
            }
        };

        if (isDeveloperMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDeveloperMenuOpen]);

    return (
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    {/* 왼쪽: 저작권 및 면책 조항 */}
                    <div className="text-center md:text-left">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            © 2025 DidimLog. All rights reserved.
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug">
                            DidimLog is a personal study tool not affiliated with Baekjoon Online Judge (BOJ) or solved.ac.
                            <br />
                            Problem data powered by BOJ. Tier data provided by solved.ac.
                        </p>
                    </div>

                    {/* 오른쪽: 개발자 정보 버튼 및 문의하기 */}
                    <div className="flex items-center gap-4">
                        {/* 개발자 정보 드롭다운 */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsDeveloperMenuOpen(!isDeveloperMenuOpen)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span>개발자 정보</span>
                                {isDeveloperMenuOpen ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            {/* 드롭다운 메뉴 */}
                            {isDeveloperMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Developer</p>
                                    </div>
                                    <div className="py-2">
                                        <a
                                            href="https://github.com/stdiodh"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsDeveloperMenuOpen(false)}
                                        >
                                            <Github className="w-4 h-4" />
                                            <span>GitHub</span>
                                        </a>
                                        <a
                                            href="https://velog.io/@stdiodh/posts"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsDeveloperMenuOpen(false)}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>Velog Blog</span>
                                        </a>
                                        <a
                                            href="mailto:playlistdh@gmail.com"
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsDeveloperMenuOpen(false)}
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>Email</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 문의하기 버튼 */}
                        <button
                            onClick={handleFeedbackClick}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            문의하기
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

