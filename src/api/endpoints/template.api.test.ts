import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPost, mockPut } = vi.hoisted(() => {
    return {
        mockPost: vi.fn(),
        mockPut: vi.fn(),
    };
});

vi.mock('../client', () => ({
    apiClient: {
        post: mockPost,
        put: mockPut,
    },
}));

import { templateApi } from './template.api';

describe('templateApi', () => {
    beforeEach(() => {
        mockPost.mockReset();
        mockPut.mockReset();
    });

    it('renderTemplate은 POST body로 렌더 요청을 보낸다', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                renderedContent: '# rendered',
            },
        });

        const result = await templateApi.renderTemplate('tpl-1', 1000, {
            programmingLanguage: 'KOTLIN',
            code: 'fun main() {}',
        });

        expect(mockPost).toHaveBeenCalledWith('/templates/tpl-1/render', {
            problemId: 1000,
            programmingLanguage: 'KOTLIN',
            code: 'fun main() {}',
        });
        expect(result.renderedContent).toBe('# rendered');
    });

    it('setDefaultTemplate은 category query를 포함해 요청한다', async () => {
        mockPut.mockResolvedValueOnce({
            data: {
                id: 'tpl-1',
                title: 'my template',
            },
        });

        await templateApi.setDefaultTemplate('tpl-1', 'SUCCESS');

        expect(mockPut).toHaveBeenCalledWith('/templates/tpl-1/default?category=SUCCESS');
    });
});
