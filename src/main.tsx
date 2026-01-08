/**
 * 진입점
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/react-query';
import { router } from './router';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './index.css';

// 테마 초기화: React 렌더링 전에 동기적으로 실행
const rootElement = document.getElementById('root')!;

// persist된 테마를 동기적으로 읽어서 즉시 적용 (렌더링 전)
const savedTheme = localStorage.getItem('ui-storage');
if (savedTheme) {
    try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch {
        // 기본값: 라이트 모드
        document.documentElement.classList.remove('dark');
    }
} else {
    // 기본값: 라이트 모드
    document.documentElement.classList.remove('dark');
}

export const App = () => {
    return <RouterProvider router={router} />;
};

createRoot(rootElement).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Toaster position="top-center" richColors />
                <App />
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>
);
