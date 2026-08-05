import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./Header', () => ({
    Header: () => <div>actual header</div>,
}));

vi.mock('./Footer', () => ({
    Footer: () => <div>actual footer</div>,
}));

vi.mock('../../stores/tour.store', () => ({
    useTourStore: (selector: (state: { run: boolean }) => unknown) => selector({ run: false }),
}));

vi.mock('../../stores/auth.store', () => ({
    useAuthStore: (selector: (state: { user: null }) => unknown) => selector({ user: null }),
}));

import { Layout } from './Layout';

describe('Layout', () => {
    it('주입값이 없으면 기존 Header와 Footer를 유지한다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Layout>content</Layout>
            </MemoryRouter>
        );

        expect(html).toContain('actual header');
        expect(html).toContain('actual footer');
        expect(html).toContain('content');
    });

    it('데모는 전용 Header를 주입하고 Footer를 생략할 수 있다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Layout header={<div>demo header</div>} footer={null} enableTour={false}>
                    demo content
                </Layout>
            </MemoryRouter>
        );

        expect(html).toContain('demo header');
        expect(html).toContain('demo content');
        expect(html).not.toContain('actual header');
        expect(html).not.toContain('actual footer');
    });
});
