/**
 * OAuth 콜백 페이지
 */

import { useEffect } from 'react';
import type { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOAuth } from '../../../hooks/auth/useOAuth';
import { Spinner } from '../../../components/ui/Spinner';

export const OAuthCallbackPage: FC = () => {
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useOAuth();

    useEffect(() => {
        handleOAuthCallback(searchParams);
    }, [searchParams, handleOAuthCallback]);

    return <Spinner />;
};


