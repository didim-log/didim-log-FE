/**
 * 학습 React Query 훅
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studyApi } from '../../api/endpoints/study.api';
import type { SolutionSubmitRequest } from '../../types/api/study.types';

export const useSubmitSolution = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SolutionSubmitRequest) => studyApi.submitSolution(data),
        onSuccess: () => {
            // 대시보드 및 통계 데이터 무효화
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['statistics'] });
        },
    });
};













