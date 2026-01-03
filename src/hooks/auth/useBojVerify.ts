/**
 * BOJ 인증 훅
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/endpoints/auth.api';

interface UseBojVerifyReturn {
    issueCode: () => Promise<void>;
    verify: (bojId: string) => Promise<boolean>;
    sessionId: string | null;
    code: string | null;
    isLoading: boolean;
    error: Error | null;
}

export const useBojVerify = (): UseBojVerifyReturn => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);

    const issueCodeMutation = useMutation({
        mutationFn: authApi.issueBojCode,
        onSuccess: (data) => {
            setSessionId(data.sessionId);
            setCode(data.code);
        },
    });

    const verifyMutation = useMutation({
        mutationFn: (bojId: string) => {
            if (!sessionId) {
                throw new Error('세션이 없습니다. 먼저 인증 코드를 발급받아주세요.');
            }
            return authApi.verifyBoj({ sessionId, bojId });
        },
    });

    const issueCode = async (): Promise<void> => {
        await issueCodeMutation.mutateAsync();
    };

    const verify = async (bojId: string): Promise<boolean> => {
        const result = await verifyMutation.mutateAsync(bojId);
        return result.verified;
    };

    return {
        issueCode,
        verify,
        sessionId,
        code,
        isLoading: issueCodeMutation.isPending || verifyMutation.isPending,
        error: issueCodeMutation.error || verifyMutation.error || null,
    };
};




