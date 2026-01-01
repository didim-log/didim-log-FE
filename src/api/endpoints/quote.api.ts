/**
 * 명언 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { QuoteResponse } from '../../types/api/quote.types';

export const quoteApi = {
    /**
     * 랜덤 명언 조회
     */
    getRandomQuote: async (): Promise<QuoteResponse | null> => {
        try {
            const response = await apiClient.get<QuoteResponse>('/api/v1/quotes/random');
            return response.data;
        } catch (error: any) {
            // 204 No Content인 경우 null 반환
            if (error.response?.status === 204) {
                return null;
            }
            throw error;
        }
    },
};


