import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
    it('테마 전환 버튼을 렌더링하고 전환 타이틀을 포함한다', () => {
        const html = renderToStaticMarkup(<ThemeToggle />);

        expect(html).toContain('aria-label="테마 변경"');
        expect(html).toMatch(/title="(다크 모드로 전환|라이트 모드로 전환)"/);
    });
});
