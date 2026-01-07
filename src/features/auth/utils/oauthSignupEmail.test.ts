import { describe, expect, it } from 'vitest';
import { getOAuthSignupEmailViewModel } from './oauthSignupEmail';

describe('getOAuthSignupEmailViewModel', () => {
    it('oauthState가 없으면 빈 이메일/잠금 해제 상태를 반환한다', () => {
        const result = getOAuthSignupEmailViewModel(null);

        expect(result.email).toBe('');
        expect(result.isLocked).toBe(false);
        expect(result.shouldShowGithubPrivateEmailToast).toBe(false);
    });

    it('이메일이 있으면 trim 후 잠금 상태를 반환한다', () => {
        const result = getOAuthSignupEmailViewModel({
            email: ' test@example.com ',
            provider: 'GOOGLE',
            providerId: '123',
            profileImage: null,
        });

        expect(result.email).toBe('test@example.com');
        expect(result.isLocked).toBe(true);
        expect(result.shouldShowGithubPrivateEmailToast).toBe(false);
    });

    it('GITHUB인데 이메일이 비어있으면 토스트 표시 플래그를 반환한다', () => {
        const result = getOAuthSignupEmailViewModel({
            email: '',
            provider: 'GITHUB',
            providerId: '123',
            profileImage: null,
        });

        expect(result.isLocked).toBe(false);
        expect(result.shouldShowGithubPrivateEmailToast).toBe(true);
    });
});



