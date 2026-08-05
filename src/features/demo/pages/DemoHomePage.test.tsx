import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/auth/useLogin', () => ({
    useLogin: () => ({
        login: vi.fn(),
        isLoading: false,
    }),
}));

vi.mock('../../../api/endpoints/system.api', () => ({
    systemApi: {
        getSystemStatus: vi.fn(),
    },
}));

vi.mock('../../../config/env', () => ({
    SERVER_ROOT: 'http://localhost:8080',
}));

vi.mock('../../../components/common/ThemeToggle', () => ({
    ThemeToggle: () => null,
}));

import { DemoLoginPage } from './DemoLoginPage';
import {
    DEMO_CATEGORY_META,
    DEMO_DASHBOARD,
    DEMO_NOTICES,
    DEMO_PROBLEM_DETAILS,
    DEMO_PROBLEMS,
    DEMO_STATISTICS,
} from '../data/demo.fixture';

describe('실제 화면 기반 공개 데모', () => {
    it('루트에서 실제 로그인 폼과 데모 안내를 함께 표시한다', () => {
        const html = renderToStaticMarkup(
            <MemoryRouter initialEntries={['/']}>
                <DemoLoginPage />
            </MemoryRouter>
        );

        expect(html).toContain('data-testid="demo-login-page"');
        expect(html).toContain('data-testid="demo-mode-bar"');
        expect(html).toContain('BOJ ID');
        expect(html).toContain('비밀번호');
        expect(html).toContain('샘플 데이터 · 입력은 저장되지 않습니다.');
        expect(html).toContain('href="/login"');
        expect(html).not.toContain('recommendation.trace');
    });

    it('대시보드 fixture가 실제 응답 형태와 모든 상세 문제를 제공한다', () => {
        expect(DEMO_DASHBOARD.studentProfile.bojId).toBe('pDemo');
        expect(DEMO_DASHBOARD.todaySolvedProblems).toHaveLength(2);
        expect(DEMO_STATISTICS.totalSolved).toBeGreaterThan(0);
        expect(DEMO_NOTICES.some((notice) => notice.isPinned)).toBe(true);
        expect(DEMO_CATEGORY_META.some((category) => category.englishName === 'BFS')).toBe(true);
        expect(DEMO_PROBLEMS.every((problem) => DEMO_PROBLEM_DETAILS[problem.id])).toBe(true);
        expect(Object.keys(DEMO_PROBLEM_DETAILS)).toHaveLength(DEMO_PROBLEMS.length);

        const solvedIds = new Set(DEMO_DASHBOARD.todaySolvedProblems.map((problem) => problem.problemId));
        const recommendedProblems = DEMO_PROBLEMS.filter((problem) => !solvedIds.has(problem.id));
        expect(recommendedProblems).toHaveLength(4);
        expect(recommendedProblems.some((problem) => problem.language === 'en')).toBe(true);
    });
});
