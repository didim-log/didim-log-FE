import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { NoticeResponse } from '../../../types/api/notice.types';
import type { StatisticsResponse } from '../../../types/api/statistics.types';

const { mockUseNotices, mockUseStatistics } = vi.hoisted(() => ({
    mockUseNotices: vi.fn(),
    mockUseStatistics: vi.fn(),
}));

vi.mock('../../../hooks/api/useNotice', () => ({
    useNotices: mockUseNotices,
}));

vi.mock('../../../hooks/api/useStatistics', () => ({
    useStatistics: mockUseStatistics,
}));

import { NoticeWidget } from './NoticeWidget';
import { StatisticsPreview } from './StatisticsPreview';

describe('dashboard data overrides', () => {
    it('공지 override를 표시할 때 실제 공지 query와 링크를 끈다', () => {
        const notices: NoticeResponse[] = [{
            id: 'demo-notice',
            title: '데모 안내',
            content: '샘플 데이터입니다.',
            isPinned: true,
            createdAt: '2026-08-05T00:00:00Z',
            updatedAt: '2026-08-05T00:00:00Z',
        }];
        mockUseNotices.mockReturnValue({ data: undefined, isLoading: false, error: null });

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <NoticeWidget dataOverride={notices} />
            </MemoryRouter>
        );

        expect(mockUseNotices).toHaveBeenCalledWith(
            { page: 1, size: 3 },
            { enabled: false },
        );
        expect(html).toContain('데모 안내');
        expect(html).not.toContain('href=');
    });

    it('통계 override를 표시할 때 실제 통계 query와 링크를 끈다', () => {
        const statistics: StatisticsResponse = {
            monthlyHeatmap: [],
            totalSolved: 28,
            totalRetrospectives: 12,
            totalFailures: 3,
            averageSolveTime: 1800,
            successRate: 80,
            categoryStats: [],
            weaknessStats: [],
        };
        mockUseStatistics.mockReturnValue({ data: undefined, isLoading: false });

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <StatisticsPreview dataOverride={statistics} />
            </MemoryRouter>
        );

        expect(mockUseStatistics).toHaveBeenCalledWith({ enabled: false });
        expect(html).toContain('12');
        expect(html).toContain('샘플 데이터');
        expect(html).not.toContain('href=');
    });
});
