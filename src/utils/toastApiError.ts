/**
 * API 에러 토스트 처리 유틸리티
 *
 * - 폼 필드 에러(예: 특정 input 하단 에러)는 호출 측에서 처리하고,
 *   그 외 서버/네트워크 에러를 토스트로 단일 처리할 때 사용합니다.
 * - Rate Limit(429)의 경우 부가 정보를 함께 노출합니다.
 */

import { toast } from 'sonner';
import { getErrorMessage, isApiErrorWithResponse } from '../types/api/common.types';

const DEFAULT_FALLBACK_MESSAGE = '요청 처리 중 오류가 발생했습니다.';

export const toastApiError = (error: unknown, fallbackMessage = DEFAULT_FALLBACK_MESSAGE): void => {
    if (!isApiErrorWithResponse(error)) {
        toast.error(getErrorMessage(error) || fallbackMessage);
        return;
    }

    const status = error.response.status;
    const message = getErrorMessage(error) || fallbackMessage;

    if (status !== 429) {
        toast.error(message);
        return;
    }

    const remainingAttempts = error.response.data?.remainingAttempts;
    const unlockTime = error.response.data?.unlockTime;

    const hasRemainingAttempts = typeof remainingAttempts === 'number' && remainingAttempts >= 0;
    const hasUnlockTime = typeof unlockTime === 'string' && unlockTime.length > 0;

    if (!hasRemainingAttempts && !hasUnlockTime) {
        toast.error(message);
        return;
    }

    const descriptionParts: string[] = [];
    if (hasRemainingAttempts) {
        descriptionParts.push(`남은 시도 횟수: ${remainingAttempts}회`);
    }
    if (hasUnlockTime) {
        descriptionParts.push(`재시도 가능 시간: ${unlockTime}`);
    }

    toast.error(message, {
        description: descriptionParts.join(' · '),
        duration: 5000,
    });
};
