/**
 * 레이아웃 컴포넌트
 */

import { ScrollToTop } from '../common/ScrollToTop';

import type { FC, ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <Header />
                <main className="flex-1 w-full">{children}</main>
                <Footer />
            </div>
        </>
    );
};

