import { describe, expect, it } from 'vitest';
import { convertBlocksToMarkdown, parseMarkdownToBlocks } from './templateBlockConverter';

describe('templateBlockConverter', () => {
    it('기존 섹션 본문을 파싱 후 다시 마크다운으로 변환할 때 본문을 보존한다', () => {
        const markdown = [
            '# 🏆 [백준/BOJ] {{problemId}}번 {{problemTitle}}',
            '',
            '## 접근 방법',
            '',
            'BFS로 풀었습니다.',
            '',
            '### 배운 점',
            '',
            '- 방문 처리 순서가 중요했습니다.',
        ].join('\n');

        const blocks = parseMarkdownToBlocks(markdown, '회고 제목');
        const restored = convertBlocksToMarkdown(blocks);

        expect(restored).toContain('## 접근 방법');
        expect(restored).toContain('BFS로 풀었습니다.');
        expect(restored).toContain('### 배운 점');
        expect(restored).toContain('- 방문 처리 순서가 중요했습니다.');
    });

    it('헤더가 없는 템플릿은 제목 블록을 자동으로 삽입한다', () => {
        const blocks = parseMarkdownToBlocks('본문만 있는 템플릿', '회고 제목');
        expect(blocks[0].level).toBe('h1');
        expect(blocks[0].title).toBe('회고 제목');
    });
});
