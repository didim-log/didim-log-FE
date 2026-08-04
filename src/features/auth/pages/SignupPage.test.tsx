import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const { mockSignup, mockUseAuthStore, mockUseOnboardingStore } = vi.hoisted(() => ({
    mockSignup: vi.fn(),
    mockUseAuthStore: vi.fn(() => ({ setTokens: vi.fn(), setUser: vi.fn() })),
    mockUseOnboardingStore: vi.fn(() => ({ setIsNewUser: vi.fn() })),
}));

vi.mock('../../../api/endpoints/auth.api', () => ({
    authApi: {
        signup: mockSignup,
    },
}));

vi.mock('../../../stores/auth.store', () => ({
    useAuthStore: mockUseAuthStore,
}));

vi.mock('../../../stores/onboarding.store', () => ({
    useOnboardingStore: mockUseOnboardingStore,
}));

import { SignupPage } from './SignupPage';

describe('SignupPage', () => {
    it('소셜 회원가입 state가 있어도 단계형 SignupPage를 렌더링한다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/signup',
                        state: {
                            email: 'test@example.com',
                            provider: 'GOOGLE',
                            providerId: '123',
                            profileImage: null,
                        },
                    },
                ]}
            >
                <SignupPage />
            </MemoryRouter>
        );

        expect(html).toContain('회원가입');
        expect(html).not.toContain('회원가입 마무리');
    });

    it('데모 모드는 인증 store 없이 전달받은 배너와 실제 가입 위저드를 렌더링한다', () => {
        mockSignup.mockClear();
        mockUseAuthStore.mockClear();
        mockUseOnboardingStore.mockClear();

        const html = renderToStaticMarkup(
            <MemoryRouter initialEntries={['/demo/boj']}>
                <SignupPage demoMode banner={<p>데모 모드 · 입력 내용은 저장되지 않습니다.</p>} />
            </MemoryRouter>
        );

        expect(html).toContain('회원가입');
        expect(html).toContain('약관 동의');
        expect(html).toContain('BOJ 인증');
        expect(html).toContain('데모 모드 · 입력 내용은 저장되지 않습니다.');
        expect(mockSignup).not.toHaveBeenCalled();
        expect(mockUseAuthStore).not.toHaveBeenCalled();
        expect(mockUseOnboardingStore).not.toHaveBeenCalled();
    });
});
