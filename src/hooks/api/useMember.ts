/**
 * 회원(닉네임) React Query 훅
 */

import { useMutation } from '@tanstack/react-query';
import { memberApi } from '../../api/endpoints/member.api';
import type { UpdateMyNicknameRequest } from '../../types/api/member.types';

export const useCheckNickname = () => {
    return useMutation({
        mutationFn: (nickname: string) => memberApi.checkNickname(nickname),
    });
};

export const useUpdateMyNickname = () => {
    return useMutation({
        mutationFn: (data: UpdateMyNicknameRequest) => memberApi.updateMyNickname(data),
    });
};





