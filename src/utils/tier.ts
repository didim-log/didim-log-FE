/**
 * 티어 관련 유틸리티 함수
 */

/**
 * Solved.ac 레벨(1~30)을 받아서 티어 이름을 반환합니다.
 */
export const getTierName = (level: number): string => {
    if (level <= 0) return 'UNRATED';
    if (level <= 5) return 'BRONZE';
    if (level <= 10) return 'SILVER';
    if (level <= 15) return 'GOLD';
    if (level <= 20) return 'PLATINUM';
    if (level <= 25) return 'DIAMOND';
    if (level <= 30) return 'RUBY';
    return 'UNRATED';
};

/**
 * 레벨을 로마숫자로 변환합니다 (V, IV, III, II, I)
 */
export const getTierStep = (level: number): string => {
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
    return `${tierName} ${tierStep}`;
};

/**
 * 티어 이름(difficulty)과 레벨(difficultyLevel)을 받아서 "Gold II" 형식의 티어 문자열을 반환합니다.
 * difficulty가 이미 제공되는 경우 이를 우선 사용합니다.
 */
export const formatTierFromDifficulty = (difficulty: string, difficultyLevel: number): string => {
    // difficulty가 이미 제공되면 이를 사용하고, 레벨로부터 step을 계산
    const tierStep = getTierStep(difficultyLevel);
    return `${difficulty} ${tierStep}`;
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
        UNRATED: 'bg-gray-400/80 text-white dark:bg-gray-500/70 dark:text-white',
    };
    return tierColors[tier.toUpperCase()] || tierColors.UNRATED;
};


