/**
 * 학생 프로필 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { UpdateProfileRequest } from '../../types/api/student.types';

import type { StudentProfileResponse } from '../../types/api/dashboard.types';

export const studentApi = {
    /**
     * 프로필 수정
     */
    updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
        await apiClient.patch('/api/v1/students/me', data);
    },

    /**
     * 계정 삭제
     */
    deleteAccount: async (): Promise<void> => {
        await apiClient.delete('/api/v1/students/me');
    },

    /**
     * BOJ 프로필 동기화
     */
    syncBojProfile: async (): Promise<StudentProfileResponse> => {
        const response = await apiClient.post<StudentProfileResponse>('/api/v1/students/sync');
        return response.data;
    },
};




