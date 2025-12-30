/**
 * 공통 API 타입 정의
 */

export interface ErrorResponse {
    status: number;
    error: string;
    code: string;
    message: string;
}

export interface PageRequest {
    page?: number;
    size?: number;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
