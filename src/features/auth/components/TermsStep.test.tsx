import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TermsStep } from './TermsStep';

describe('TermsStep', () => {
    it('약관 박스에 다크 모드 텍스트/배경 클래스가 명시되어 있다', () => {
        const html = renderToStaticMarkup(<TermsStep onNext={() => {}} />);

        expect(html).toContain('dark:bg-gray-800');
        expect(html).toContain('dark:text-gray-200');
    });
});

