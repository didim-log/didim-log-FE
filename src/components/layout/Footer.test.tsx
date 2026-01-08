import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer', () => {
    it('Footer는 컴팩트한 패딩/폰트 크기를 가진다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(html).toContain('py-4');
        expect(html).toContain('text-[10px]');
    });
});
