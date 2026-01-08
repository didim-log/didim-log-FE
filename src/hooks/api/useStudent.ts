/**
 * 학생 프로필 React Query 훅
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../../api/endpoints/student.api';
import { useAuthStore } from '../../stores/auth.store';
import type { UpdateProfileRequest } from '../../types/api/student.types';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => studentApi.updateProfile(data),
        onSuccess: async (_, variables) => {
            // 대시보드 데이터 무효화 및 강제 재조회 (primaryLanguage 포함)
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            await queryClient.refetchQueries({ queryKey: ['dashboard'] });
            
            // 대시보드에서 최신 primaryLanguage 가져와서 user 업데이트
            // refetchQueries 후 queryClient.getQueryData를 사용하여 안전하게 가져옴
            const dashboardData = queryClient.getQueryData<import('../../types/api/dashboard.types').DashboardResponse>(['dashboard']);
            const updatedPrimaryLanguage = dashboardData?.studentProfile?.primaryLanguage ?? null;
            
            // 전역 상태 업데이트: 닉네임 및 primaryLanguage
            if (user) {
                const updatedUser = {
                    ...user,
                    ...(variables.nickname ? { nickname: variables.nickname } : {}),
                    primaryLanguage: updatedPrimaryLanguage, // 항상 업데이트 (null 포함)
                };
                setUser(updatedUser);
            }
        },
    });
};

export const useDeleteAccount = () => {
    return useMutation({
        mutationFn: () => studentApi.deleteAccount(),
    });
};

export const useSyncBojProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => studentApi.syncBojProfile(),
        onSuccess: async () => {
            // 대시보드 데이터 무효화 및 강제 재조회
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            await queryClient.refetchQueries({ queryKey: ['dashboard'] });
        },
    });
};
