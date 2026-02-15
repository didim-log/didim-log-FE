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
            // 문제 제출 직후에는 대시보드만 갱신합니다.
            // 통계는 "유효한 회고" 저장/수정/삭제 시점에만 갱신되어야 합니다.
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
