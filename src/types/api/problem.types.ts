/**
 * 문제 관련 API 타입 정의
 */

export interface ProblemResponse {
    id: string;
    title: string;
    category: string;
    primaryCategory?: string;
    secondaryCategories?: string[];
    normalizedTags?: string[];
    difficulty: string;
    difficultyLevel: number;
    url: string;
    language: string; // "ko" or "en"
    matchedByPrimary?: boolean | null;
    matchedByTags?: boolean | null;
    expandedFrom?: string[];
}

export interface ProblemDetailResponse {
    id: string;
    title: string;
    category: string;
    primaryCategory?: string;
    secondaryCategories?: string[];
    normalizedTags?: string[];
    difficulty: string;
    difficultyLevel: number;
    url: string;
    descriptionHtml: string | null;
    inputDescriptionHtml: string | null;
    outputDescriptionHtml: string | null;
    sampleInputs: string[] | null;
    sampleOutputs: string[] | null;
    tags: string[];
    language: string; // "ko" or "en"
}

export interface RecommendRequest {
    count?: number;
    category?: string;
    language?: string; // "ko" or "en", null이면 모든 언어
    filterMode?: CategoryFilterMode;
}

export type CategoryFilterMode = 'EXACT' | 'HIERARCHY' | 'RELATED';

export interface ProblemCategoryMetaResponse {
    canonical: string;
    englishName: string;
    koreanName: string;
    aliases: string[];
    parents: string[];
    children: string[];
    related: string[];
}

export interface SearchRequest {
    q: number;
}
