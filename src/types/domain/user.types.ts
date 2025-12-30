/**
 * 사용자 도메인 타입 정의
 */

export interface User {
    id: string;
    nickname: string;
    bojId: string | null;
    email: string | null;
    role: 'USER' | 'ADMIN' | 'GUEST';
    rating: number;
    tier: string;
    tierLevel: number;
    provider: 'BOJ' | 'GOOGLE' | 'GITHUB' | 'NAVER';
    /**
     * 사용자가 설정한 주 언어 (백엔드 PrimaryLanguage enum)
     * - 예: "JAVA", "PYTHON", ...
     * - 미설정: null
     */
    primaryLanguage?: string | null;
}

