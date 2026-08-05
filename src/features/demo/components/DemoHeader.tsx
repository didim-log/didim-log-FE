import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface DemoHeaderProps {
    showRecommendationLink?: boolean;
}

export const DemoHeader = ({ showRecommendationLink = false }: DemoHeaderProps) => {
    return (
        <header data-testid="demo-header" className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    to="/demo/dashboard"
                    className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400 sm:text-2xl">디딤로그</span>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                        Demo
                    </span>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-5" aria-label="데모 메뉴">
                    <Link
                        to="/demo/dashboard"
                        className="rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                        대시보드
                    </Link>
                    {showRecommendationLink && (
                        <a
                            href="#recommend-section"
                            className="hidden rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:text-blue-400 sm:inline-flex"
                        >
                            문제 추천
                        </a>
                    )}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-offset-gray-800"
                    >
                        <LogIn className="h-4 w-4" />
                        실제 로그인
                    </Link>
                </nav>
            </div>
        </header>
    );
};
