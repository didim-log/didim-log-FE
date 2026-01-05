/**
 * 로딩 스피너 컴포넌트
 */

import type { FC } from 'react';

export const Spinner: FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
};


