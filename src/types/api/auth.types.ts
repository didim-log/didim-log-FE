/**
 * 인증 관련 API 타입 정의
 */

export interface SignupRequest {
    bojId: string;
    password: string;
    email: string;
}

export interface LoginRequest {
    bojId: string;
    password: string;
}

export interface SuperAdminRequest {
    bojId: string;
    password: string;
    email: string;
    adminKey: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    message: string;
    rating: number;
    tier: string;
    tierLevel: number;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface SignupFinalizeRequest {
    email: string;
    provider: 'GOOGLE' | 'GITHUB' | 'NAVER';
    providerId: string;
    nickname: string;
    bojId?: string | null;
    isAgreedToTerms: boolean;
    termsAgreed?: boolean;
}

export interface FindAccountRequest {
    email: string;
}

export interface FindAccountResponse {
    provider: string;
    message: string;
}

export interface FindIdRequest {
    email: string;
}

export interface FindPasswordRequest {
    email: string;
    bojId: string;
}

export interface ResetPasswordRequest {
    resetCode: string;
    newPassword: string;
}

export interface FindIdPasswordResponse {
    message: string;
}

export interface BojCodeIssueResponse {
    sessionId: string;
    code: string;
    expiresInSeconds: number;
}

export interface BojVerifyRequest {
    sessionId: string;
    bojId: string;
}

export interface BojVerifyResponse {
    verified: boolean;
    verifiedBojId: string;
}

export interface BojIdDuplicateCheckResponse {
    isDuplicate: boolean;
    message: string;
}


