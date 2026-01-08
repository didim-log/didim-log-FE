import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
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
});
