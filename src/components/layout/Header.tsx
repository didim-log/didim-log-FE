/**
 * 헤더 컴포넌트 (모바일 반응형)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { useTourStore } from '../../stores/tour.store';
import { HelpCircle, Menu, X } from 'lucide-react';

export const Header: FC = () => {
    const { logout, user } = useAuthStore();
    const { theme, toggleTheme } = useUIStore();
    const navigate = useNavigate();
    const { startTour } = useTourStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const handleHelpClick = () => {
        setIsMobileMenuOpen(false);
        // Force reset tour state and go to start page
        navigate('/dashboard');
        // 페이지 마운트 후 투어 시작 (타겟 요소가 렌더링될 시간 확보)
        setTimeout(() => {
            startTour();
        }, 100); // Slight delay to ensure navigation happens first
    };

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 로고 */}
                    <Link to="/dashboard" className="flex items-center" onClick={handleNavClick}>
                        <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">디딤로그</h1>
                    </Link>

                    {/* 데스크톱 네비게이션 (md 이상에서만 표시) */}
                    <nav id="menu-section" className="hidden md:flex items-center gap-4 lg:gap-6">
                        <Link
                            to="/ranking"
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm lg:text-base"
                        >
                            랭킹
                        </Link>
                        <Link
                            to="/profile"
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm lg:text-base"
                        >
                            내 정보
                        </Link>
                        {/* 관리자 버튼 - ADMIN 권한일 때만 표시 */}
                        {user?.role === 'ADMIN' && (
                            <Link
                                to="/admin/dashboard"
                                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-white bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-lg transition-colors"
                            >
                                관리자
                            </Link>
                        )}

                        {/* 가이드 버튼 (온보딩 투어 재시작) */}
                        <button
                            onClick={handleHelpClick}
                            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="가이드 보기"
                            title="가이드 보기"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>

                        {/* 다크 모드 토글 */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="테마 변경"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* 로그아웃 버튼 */}
                        <button
                            onClick={handleLogout}
                            className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            로그아웃
                        </button>
                    </nav>

                    {/* 모바일 햄버거 메뉴 버튼 (md 미만에서만 표시) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="메뉴 열기/닫기"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* 모바일 메뉴 (Drawer 패턴) */}
                {isMobileMenuOpen && (
                    <>
                        {/* 오버레이 */}
                        <div
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* 메뉴 패널 */}
                        <nav className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50 md:hidden">
                            <div className="px-4 py-4 space-y-3">
                                <Link
                                    to="/ranking"
                                    onClick={handleNavClick}
                                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    랭킹
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={handleNavClick}
                                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    내 정보
                                </Link>
                                {user?.role === 'ADMIN' && (
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={handleNavClick}
                                        className="block px-4 py-2 text-white bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-lg transition-colors"
                                    >
                                        관리자
                                    </Link>
                                )}
                                <button
                                    onClick={handleHelpClick}
                                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    가이드 보기
                                </button>
                                <div className="flex items-center justify-between px-4 py-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">다크 모드</span>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        aria-label="테마 변경"
                                    >
                                        {theme === 'dark' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </nav>
                    </>
                )}
            </div>
        </header>
    );
};

