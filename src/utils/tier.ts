/**
 * 티어 관련 유틸리티 함수
 */

/**
 * Solved.ac Tier 정수(level)를 티어 이름/단계로 변환합니다.
 *
 * Solved.ac 기준 (헷갈리지 않게 정수 매핑을 명시합니다):
 * - 0: Unrated
 * - 1 ~ 5: Bronze (1=Bronze V, 2=IV, 3=III, 4=II, 5=I)
 * - 6 ~ 10: Silver (6=Silver V, ..., 10=I)
 * - 11 ~ 15: Gold (11=Gold V, ..., 15=I)
 * - 16 ~ 20: Platinum
 * - 21 ~ 25: Diamond
 * - 26 ~ 30: Ruby
 * - 31: Master
 */
export type SolvedAcTierName =
    | 'Unrated'
    | 'Bronze'
    | 'Silver'
    | 'Gold'
    | 'Platinum'
    | 'Diamond'
    | 'Ruby'
    | 'Master';

export const getTierName = (level: number): SolvedAcTierName => {
    if (level <= 0) return 'Unrated';
    if (level <= 5) return 'Bronze';
    if (level <= 10) return 'Silver';
    if (level <= 15) return 'Gold';
    if (level <= 20) return 'Platinum';
    if (level <= 25) return 'Diamond';
    if (level <= 30) return 'Ruby';
    if (level === 31) return 'Master';
    return 'Unrated';
};

/**
 * Solved.ac Tier(level)별 달성에 필요한 AC 레이팅 최소값입니다.
 * 출처: solved.ac 도움말 "티어와 AC 레이팅" 표
 * - `https://help.solved.ac/ko/stats/ac-rating`
 */
export const SOLVED_AC_TIER_MIN_RATING: Record<number, number> = {
    0: 0,
    1: 30,
    2: 60,
    3: 90,
    4: 120,
    5: 150,
    6: 200,
    7: 300,
    8: 400,
    9: 500,
    10: 650,
    11: 800,
    12: 950,
    13: 1100,
    14: 1250,
    15: 1400,
    16: 1600,
    17: 1750,
    18: 1900,
    19: 2000,
    20: 2100,
    21: 2200,
    22: 2300,
    23: 2400,
    24: 2500,
    25: 2600,
    26: 2700,
    27: 2800,
    28: 2850,
    29: 2900,
    30: 2950,
    31: 3000,
};

export const getTierMinRating = (tierLevel: number): number => {
    const normalized = Math.max(0, Math.min(31, Math.floor(tierLevel)));
    return SOLVED_AC_TIER_MIN_RATING[normalized] ?? 0;
};

/**
 * Solved.ac AC 레이팅으로부터 티어 레벨(0~31)을 계산합니다.
 *
 * 백엔드가 `tierLevel`을 정확한 solved.ac 단계(0~31)로 내려주므로,
 * 이 함수는 fallback(백엔드 `tierLevel`이 없거나 이상한 값일 때만)으로 사용됩니다.
 */
export const getTierLevelFromRating = (rating: number): number => {
    const normalized = Math.max(0, Math.floor(rating));

    for (let level = 31; level >= 0; level -= 1) {
        const minRating = SOLVED_AC_TIER_MIN_RATING[level] ?? 0;
        if (normalized >= minRating) {
            return level;
        }
    }

    return 0;
};

/**
 * 티어 레벨을 해석합니다.
 *
 * 백엔드가 `tierLevel`을 정확한 solved.ac 단계(0~31)로 내려주므로,
 * `tierLevel`을 우선 사용하고, 없거나 유효하지 않은 경우에만 `rating`으로 fallback합니다.
 */
export const resolveSolvedAcTierLevel = (params: { tierLevel?: number; rating?: number }): number => {
    // tierLevel이 유효한 범위(0~31)에 있으면 그대로 사용
    if (typeof params.tierLevel === 'number') {
        const tierLevel = Math.floor(params.tierLevel);
        if (tierLevel >= 0 && tierLevel <= 31) {
            return tierLevel;
        }
    }

    // tierLevel이 없거나 유효하지 않으면 rating으로 fallback
    if (typeof params.rating === 'number') {
        return getTierLevelFromRating(params.rating);
    }

    // 둘 다 없으면 Unrated(0)
    return 0;
};

/**
 * 레벨을 로마숫자로 변환합니다 (V, IV, III, II, I)
 */
export const getTierStep = (level: number): string => {
    // Unrated(0) / Master(31)은 단계(step)가 없습니다.
    if (level <= 0 || level === 31) {
        return '';
    }

    // 1~30: 5단계 반복
    const remainder = level % 5;
    if (remainder === 1) return 'V';
    if (remainder === 2) return 'IV';
    if (remainder === 3) return 'III';
    if (remainder === 4) return 'II';
    if (remainder === 0) return 'I';
    return '';
};

/**
 * 레벨을 받아서 "Gold II" 형식의 티어 문자열을 반환합니다.
 */
export const formatTier = (level: number): string => {
    const tierName = getTierName(level);
    const tierStep = getTierStep(level);
    if (!tierStep) {
        return tierName;
    }
    return `${tierName} ${tierStep}`;
};

const normalizeTierName = (tier: string): SolvedAcTierName => {
    const normalized = tier.trim().toUpperCase();
    if (normalized === 'BRONZE') return 'Bronze';
    if (normalized === 'SILVER') return 'Silver';
    if (normalized === 'GOLD') return 'Gold';
    if (normalized === 'PLATINUM') return 'Platinum';
    if (normalized === 'DIAMOND') return 'Diamond';
    if (normalized === 'RUBY') return 'Ruby';
    if (normalized === 'MASTER') return 'Master';
    return 'Unrated';
};

/**
 * 티어 이름(difficulty)과 레벨(difficultyLevel)을 받아서 "Gold II" 형식의 티어 문자열을 반환합니다.
 * difficulty가 이미 제공되는 경우 이를 우선 사용합니다.
 */
export const formatTierFromDifficulty = (difficulty: string, difficultyLevel: number): string => {
    // difficulty가 이미 제공되면 이를 사용하고, 레벨로부터 step을 계산
    const tierStep = getTierStep(difficultyLevel);
    const tierName = normalizeTierName(difficulty);
    if (!tierStep) {
        return tierName;
    }
    return `${tierName} ${tierStep}`;
};

/**
 * 티어 색상을 반환합니다.
 * 백준 온라인 저지(BOJ)의 공식 티어 색상을 사용하되, 약간 연한 톤으로 조정합니다.
 * 배경색은 약간 연한 색상, 텍스트는 흰색을 사용합니다.
 */
export const getTierColor = (tier: string): string => {
    const tierColors: Record<string, string> = {
        BRONZE: 'bg-[#AD5600]/80 text-white dark:bg-[#AD5600]/70 dark:text-white',
        SILVER: 'bg-[#435F7A]/80 text-white dark:bg-[#435F7A]/70 dark:text-white',
        GOLD: 'bg-[#EC9A00]/80 text-white dark:bg-[#EC9A00]/70 dark:text-white',
        PLATINUM: 'bg-[#27E2A4]/80 text-white dark:bg-[#27E2A4]/70 dark:text-white',
        DIAMOND: 'bg-[#00B4FC]/80 text-white dark:bg-[#00B4FC]/70 dark:text-white',
        RUBY: 'bg-[#FF0062]/80 text-white dark:bg-[#FF0062]/70 dark:text-white',
        MASTER: 'bg-[#2d2d2d]/80 text-white dark:bg-[#2d2d2d]/70 dark:text-white',
        UNRATED: 'bg-gray-400/80 text-white dark:bg-gray-500/70 dark:text-white',
    };
    return tierColors[tier.toUpperCase()] || tierColors.UNRATED;
};
