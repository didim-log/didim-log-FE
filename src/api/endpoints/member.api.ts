/**
 * 회원(닉네임) 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type { UpdateMyNicknameRequest } from '../../types/api/member.types';

export const memberApi = {
    /**
     * 닉네임 사용 가능 여부(유효성 + 중복) 확인
     */
    checkNickname: async (nickname: string): Promise<boolean> => {
        const response = await apiClient.get<boolean>('/api/v1/members/check-nickname', {
            params: { nickname },
        });
        return response.data;
    },

    /**
     * 내 닉네임 변경
     */
    updateMyNickname: async (data: UpdateMyNicknameRequest): Promise<void> => {
        await apiClient.patch('/api/v1/members/me/nickname', data);
    },

    /**
     * 온보딩 투어 완료
     */
    completeOnboarding: async (): Promise<void> => {
        await apiClient.patch('/api/v1/members/onboarding/complete');
    },
};




