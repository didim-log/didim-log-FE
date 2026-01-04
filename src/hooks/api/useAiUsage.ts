/**
 * AI 사용량 관련 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { logApi } from '../../api/endpoints/log.api';

/**
 * AI 사용량 조회 훅
 */
export const useAiUsage = () => {
    return useQuery({
        queryKey: ['ai-usage'],
        queryFn: () => logApi.getAiUsage(),
        staleTime: 30 * 1000, // 30초
        refetchOnWindowFocus: true, // 창 포커스 시 자동 갱신
    });
};











