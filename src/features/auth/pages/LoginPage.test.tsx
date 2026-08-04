import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const { mockLogin, mockUseLogin, mockGetSystemStatus } = vi.hoisted(() => ({
    mockLogin: vi.fn(),
    mockUseLogin: vi.fn(),
    mockGetSystemStatus: vi.fn(),
}));

vi.mock('../../../hooks/auth/useLogin', () => ({
    useLogin: mockUseLogin,
}));

mockUseLogin.mockImplementation(() => ({
    login: mockLogin,
    isLoading: false,
}));

vi.mock('../../../api/endpoints/system.api', () => ({
    systemApi: {
        getSystemStatus: mockGetSystemStatus,
    },
}));

vi.mock('../../../config/env', () => ({
    SERVER_ROOT: 'http://localhost:8080',
}));

vi.mock('../../../components/common/ThemeToggle', () => ({
    ThemeToggle: () => null,
}));

import { getOAuthLoginError, LoginPage } from './LoginPage';

describe('LoginPage OAuth 오류 안내', () => {
    it('navigation state의 문자열 error를 기존 로그인 오류 배너에 표시한다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/login',
                        state: {
                            error: 'BOJ 계정으로 회원가입한 뒤 다시 로그인해 주세요.',
                        },
                    },
                ]}
            >
                <LoginPage />
            </MemoryRouter>
        );

        expect(html).toContain('BOJ 계정으로 회원가입한 뒤 다시 로그인해 주세요.');
    });

    it('데모 모드는 실제 로그인 훅 없이 고정 입력값과 전달받은 배너를 렌더링한다', () => {
        mockUseLogin.mockClear();
        mockGetSystemStatus.mockClear();

        const html = renderToStaticMarkup(
            <MemoryRouter initialEntries={['/']}>
                <LoginPage demoMode banner={<p>샘플 데이터는 저장되지 않습니다.</p>} />
            </MemoryRouter>
        );

        expect(html).toContain('value="pDemo"');
        expect(html).toContain('value="demo-only"');
        expect(html).toContain('data-testid="demo-login-submit"');
        expect(html).toContain('샘플 데이터는 저장되지 않습니다.');
        expect(mockUseLogin).not.toHaveBeenCalled();
        expect(mockGetSystemStatus).not.toHaveBeenCalled();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('문자열이 아니거나 빈 error state는 무시한다', () => {
        expect(getOAuthLoginError({ error: 123 })).toBeNull();
        expect(getOAuthLoginError({ error: '  ' })).toBeNull();
        expect(getOAuthLoginError({ from: '/dashboard' })).toBeNull();
    });
});
