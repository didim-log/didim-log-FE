/**
 * 피드백 React Query 훅
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '../../api/endpoints/feedback.api';
import type { FeedbackCreateRequest } from '../../types/api/feedback.types';

export const useCreateFeedback = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FeedbackCreateRequest) => feedbackApi.createFeedback(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'feedbacks'] });
        },
    });
};




