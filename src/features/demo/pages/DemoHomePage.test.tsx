import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DemoHomePage } from './DemoHomePage';

describe('DemoHomePage', () => {
    it('로그인 없이 공개 데모와 실제 로그인 경로를 안내한다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter initialEntries={['/']}>
                <DemoHomePage />
            </MemoryRouter>
        );

        expect(html).toContain('data-testid="demo-home"');
        expect(html).toContain('기록으로 이어지는');
        expect(html).toContain('알고리즘 학습');
        expect(html).toContain('데모 데이터 · 입력 내용은 저장되지 않습니다');
        expect(html).toContain('href="/login"');
        expect(html).toContain('실제 로그인');
    });
});
