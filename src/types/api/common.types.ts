/**
 * 공통 API 타입 정의
 */

export interface ErrorResponse {
    status: number;
    error: string;
    code: string;
    message: string;
}

/**
 * API 에러 타입
 * Axios 에러와 일반 에러를 모두 처리할 수 있는 타입
 */
export interface ApiError {
    response?: {
        data?: ErrorResponse;
        status?: number;
    };
    message?: string;
    code?: string;
    status?: number;
}

/**
 * ApiError 타입 가드
 */
export function isApiError(error: unknown): error is ApiError {
    if (typeof error !== 'object' || error === null) {
        return false;
    }
    return 'response' in error || 'message' in error;
}

/**
 * ApiError with response 타입 가드
 */
export function isApiErrorWithResponse(error: unknown): error is ApiError & { response: NonNullable<ApiError['response']> } {
    return isApiError(error) && error.response !== undefined;
}

/**
 * 에러에서 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.response?.data?.message || error.message || '오류가 발생했습니다.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
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
