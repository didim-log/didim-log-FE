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
            // 대시보드 데이터 무효화 및 강제 재조회
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            await queryClient.refetchQueries({ queryKey: ['dashboard'] });
            
            // 전역 상태 업데이트: 닉네임이 변경된 경우
            if (user && variables.nickname) {
                const updatedUser = {
                    ...user,
                    nickname: variables.nickname,
                };
                setUser(updatedUser);
            }
            // primaryLanguage는 User 타입에 없으므로 대시보드 재조회로 처리됨
        },
    });
};

export const useDeleteAccount = () => {
    return useMutation({
        mutationFn: () => studentApi.deleteAccount(),
    });
};

