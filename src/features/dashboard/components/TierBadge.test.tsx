import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TierBadge } from './TierBadge';

describe('TierBadge', () => {
    it('tierLevel=1이면 tier-1.svg와 Bronze V alt 텍스트를 사용한다', () => {
        const html = renderToStaticMarkup(<TierBadge tierLevel={1} size="sm" />);

        expect(html).toContain('src="/tier-1.svg"');
        expect(html).toContain('alt="Bronze V"');
    });
});
