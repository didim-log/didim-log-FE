/**
 * 명언 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { quoteApi } from '../../api/endpoints/quote.api';

export const useRandomQuote = () => {
    return useQuery({
        queryKey: ['quote', 'random'],
        queryFn: () => quoteApi.getRandomQuote(),
        staleTime: 5 * 60 * 1000, // 5분
    });
};
