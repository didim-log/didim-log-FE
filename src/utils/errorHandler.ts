/**
 * 에러 처리 유틸리티
 */

export interface ApiErrorResponse {
    status: number;
    error: string;
    code: string;
    message: string;
}

/**
 * API 에러 응답에서 사용자에게 표시할 메시지를 추출합니다.
 *
 * @param errorResponse API 에러 응답 객체
 * @returns 사용자에게 표시할 에러 메시지
 */
export function getErrorMessage(errorResponse: ApiErrorResponse): string {
    return errorResponse.message || errorResponse.error || '오류가 발생했습니다.';
}



