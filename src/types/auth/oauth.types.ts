/**
 * OAuth 관련 타입 정의
 */

export type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'NAVER';

export interface OAuthSignupState {
    email: string;
    provider: OAuthProvider;
    providerId: string;
    profileImage: string | null;
}

export interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
    if (value === null) {
        return false;
    }
    return typeof value === 'object';
};

const isProvider = (value: unknown): value is OAuthProvider => {
    if (value === 'GOOGLE') return true;
    if (value === 'GITHUB') return true;
    if (value === 'NAVER') return true;
    return false;
};

export const toOAuthProvider = (value: string): OAuthProvider | null => {
    const normalized = value.trim().toUpperCase();
    if (isProvider(normalized)) {
        return normalized;
    }
    return null;
};

export const isOAuthSignupState = (value: unknown): value is OAuthSignupState => {
    if (!isRecord(value)) {
        return false;
    }

    const hasEmail = typeof value.email === 'string';
    const hasProvider = typeof value.provider === 'string' && isProvider(value.provider);
    const hasProviderId = typeof value.providerId === 'string';
    const hasProfileImage = value.profileImage === null || typeof value.profileImage === 'string';

    return hasEmail && hasProvider && hasProviderId && hasProfileImage;
};

export const parseOAuthSignupState = (value: unknown): OAuthSignupState | null => {
    if (!isRecord(value)) {
        return null;
    }

    const providerRaw = typeof value.provider === 'string' ? value.provider : '';
    const provider = toOAuthProvider(providerRaw);
    if (!provider) {
        return null;
    }

    const providerId = typeof value.providerId === 'string' ? value.providerId : '';
    if (!providerId) {
        return null;
    }

    const email = typeof value.email === 'string' ? value.email : '';
    const profileImage = value.profileImage === null || typeof value.profileImage === 'string' ? value.profileImage : null;

    return { email, provider, providerId, profileImage };
};
