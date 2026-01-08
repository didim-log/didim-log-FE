/**
 * 대시보드 관련 API 타입 정의
 */

import type { QuoteResponse } from './quote.types';

export interface StudentProfileResponse {
    nickname: string;
    bojId: string;
    currentTier: string;
    currentTierLevel: number;
    consecutiveSolveDays: number;
    primaryLanguage: string | null; // 주로 사용하는 프로그래밍 언어 (JAVA, PYTHON, KOTLIN, etc.)
    isOnboardingFinished: boolean; // 온보딩 투어 완료 여부
}

export interface TodaySolvedProblemResponse {
    problemId: string;
    result: 'SUCCESS' | 'FAIL' | 'TIME_OVER';
    solvedAt: string; // ISO 8601 형식
}

export interface DashboardResponse {
    studentProfile: StudentProfileResponse;
    todaySolvedCount: number;
    todaySolvedProblems: TodaySolvedProblemResponse[];
    quote: QuoteResponse | null;
    currentTierTitle: string;
    nextTierTitle: string;
    currentRating: number;
    requiredRatingForNextTier: number;
    progressPercentage: number;
}
