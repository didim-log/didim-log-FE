import type { OAuthSignupState } from '@/types/auth/oauth.types';

type OAuthSignupEmailViewModel = {
    email: string;
    isLocked: boolean;
    shouldShowGithubPrivateEmailToast: boolean;
};

export const GITHUB_PRIVATE_EMAIL_TOAST_MESSAGE =
    'GitHub 이메일 정보가 비공개입니다. 이메일을 직접 입력해주세요.';

export const getOAuthSignupEmailViewModel = (
    oauthState: OAuthSignupState | null
): OAuthSignupEmailViewModel => {
    if (!oauthState) {
        return {
            email: '',
            isLocked: false,
            shouldShowGithubPrivateEmailToast: false,
        };
    }

    const trimmedEmail = oauthState.email.trim();
    const isLocked = Boolean(trimmedEmail);

    const shouldShowGithubPrivateEmailToast = oauthState.provider === 'GITHUB' && !trimmedEmail;

    return {
        email: trimmedEmail,
        isLocked,
        shouldShowGithubPrivateEmailToast,
    };
};

