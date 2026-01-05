/**
 * JWT 토큰 유틸리티
 */

import type { User } from '../types/domain/user.types';

interface JwtPayload {
    sub: string; // BOJ ID 또는 providerId
    role?: string;
    exp?: number;
    iat?: number;
}

/**
 * JWT 토큰 디코딩 (Base64 URL 디코딩)
 */
export const decodeJwt = (token: string): JwtPayload | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
};

/**
 * 토큰 만료 여부 확인
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) {
        return true;
    }

    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
};

/**
 * JWT 토큰에서 사용자 정보 추출
 * 주의: 실제로는 백엔드 API를 통해 사용자 정보를 가져와야 하지만,
 * 로그인 응답에서 받은 정보를 사용합니다.
 */
export const extractUserFromToken = (token: string, authResponse?: {
    rating?: number;
    tier?: string;
    tierLevel?: number;
}): User | null => {
    const payload = decodeJwt(token);
    if (!payload) {
        return null;
    }

    // JWT의 sub는 BOJ ID 또는 providerId
    // 실제 사용자 정보는 로그인 응답에서 받아야 합니다.
    // 여기서는 기본값만 설정하고, 실제로는 로그인 응답에서 받은 정보를 사용해야 합니다.
    return {
        id: payload.sub, // 임시로 sub를 id로 사용 (실제로는 백엔드에서 제공해야 함)
        nickname: payload.sub, // 임시
        bojId: payload.role === 'ADMIN' ? null : payload.sub, // 임시
        email: null,
        role: (payload.role as 'USER' | 'ADMIN' | 'GUEST') || 'USER',
        rating: authResponse?.rating || 0,
        tier: authResponse?.tier || 'UNRATED',
        tierLevel: authResponse?.tierLevel || 0,
        provider: 'BOJ', // 임시
    };
};
