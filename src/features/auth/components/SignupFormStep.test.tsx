import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SignupFormStep } from './SignupFormStep';

describe('SignupFormStep', () => {
    it('BOJ ID 에러가 "존재하지 않는/Not Found" 계열이면 Solved.ac 가이드와 링크를 노출한다', () => {
        const html = renderToStaticMarkup(
            <SignupFormStep
                bojId="newbie"
                onComplete={() => undefined}
                onBack={() => undefined}
                apiError={{
                    message: '존재하지 않는 백준 아이디입니다. 아이디를 확인해주세요.',
                    status: 404,
                }}
            />
        );

        expect(html).toContain('존재하지 않는 백준 아이디입니다');
        expect(html).toContain('방금 만든 계정인가요?');
        expect(html).toContain('[사용 하기]');
        expect(html).toContain('href="https://solved.ac/"');
    });

    it('BOJ ID 에러가 다른 내용이면 Solved.ac 가이드를 노출하지 않는다', () => {
        const html = renderToStaticMarkup(
            <SignupFormStep
                bojId="someone"
                onComplete={() => undefined}
                onBack={() => undefined}
                apiError={{
                    message: '이미 가입된 백준 아이디입니다. 다른 BOJ ID를 사용해주세요.',
                    code: 'DUPLICATE_BOJ_ID',
                    status: 409,
                }}
            />
        );

        expect(html).toContain('이미 가입된 백준 아이디입니다');
        expect(html).not.toContain('방금 만든 계정인가요?');
        expect(html).not.toContain('href="https://solved.ac/"');
    });
});
