/**
 * 랭킹 관련 API 타입 정의
 */

export type RankingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'TOTAL';

export interface RankingRequest {
    limit?: number; // 1~1000, default: 100
    period?: RankingPeriod; // default: TOTAL
}

export interface LeaderboardResponse {
    rank: number;
    nickname: string;
    tier: string;
    tierLevel: number;
    rating: number;
    retrospectiveCount: number;
    consecutiveSolveDays: number;
    profileImageUrl: string | null;
}














