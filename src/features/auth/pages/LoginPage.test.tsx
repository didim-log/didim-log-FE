import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/auth/useLogin', () => ({
    useLogin: () => ({
        login: vi.fn(),
        isLoading: false,
    }),
}));

vi.mock('../../../api/endpoints/system.api', () => ({
    systemApi: {
        getSystemStatus: vi.fn(),
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

    it('문자열이 아니거나 빈 error state는 무시한다', () => {
        expect(getOAuthLoginError({ error: 123 })).toBeNull();
        expect(getOAuthLoginError({ error: '  ' })).toBeNull();
        expect(getOAuthLoginError({ from: '/dashboard' })).toBeNull();
    });
});
