/**
 * OAuth 콜백 페이지
 *
 * - 화면은 최소한의 "처리 중" UI만 보여준다.
 * - Query String을 파싱해 신규 가입 / 로그인 성공 / 실패로 분기한다.
 */

import { useEffect } from 'react';
import type { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOAuthCallback } from '../../hooks/auth/useOAuthCallback';

export const OAuthCallbackPage: FC = () => {
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useOAuthCallback();

    useEffect(() => {
        handleOAuthCallback(searchParams);
    }, [handleOAuthCallback, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                <p className="text-sm text-gray-600 dark:text-gray-300">로그인 처리 중...</p>
            </div>
        </div>
    );
};


