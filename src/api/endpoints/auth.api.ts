/**
 * 인증 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    SignupRequest,
    LoginRequest,
    SuperAdminRequest,
    AuthResponse,
    SignupFinalizeRequest,
    FindAccountRequest,
    FindAccountResponse,
    FindIdRequest,
    FindPasswordRequest,
    ResetPasswordRequest,
    FindIdPasswordResponse,
    BojCodeIssueResponse,
    BojVerifyRequest,
    BojVerifyResponse,
} from '../../types/api/auth.types';

export const authApi = {
    /**
     * 회원가입
     */
    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/signup', data);
        return response.data;
    },

    /**
     * 로그인
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
        return response.data;
    },

    /**
     * 슈퍼 관리자 생성
     */
    createSuperAdmin: async (data: SuperAdminRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/super-admin', data);
        return response.data;
    },

    /**
     * 회원가입 마무리 (소셜 로그인)
     */
    signupFinalize: async (data: SignupFinalizeRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/signup/finalize', data);
        return response.data;
    },

    /**
     * 계정 찾기 (소셜 제공자 확인)
     */
    findAccount: async (data: FindAccountRequest): Promise<FindAccountResponse> => {
        const response = await apiClient.post<FindAccountResponse>('/api/v1/auth/find-account', data);
        return response.data;
    },

    /**
     * 아이디 찾기
     */
    findId: async (data: FindIdRequest): Promise<FindIdPasswordResponse> => {
        const response = await apiClient.post<FindIdPasswordResponse>('/api/v1/auth/find-id', data);
        return response.data;
    },

    /**
     * 비밀번호 찾기
     */
    findPassword: async (data: FindPasswordRequest): Promise<FindIdPasswordResponse> => {
        const response = await apiClient.post<FindIdPasswordResponse>('/api/v1/auth/find-password', data);
        return response.data;
    },

    /**
     * 비밀번호 재설정
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<FindIdPasswordResponse> => {
        const response = await apiClient.post<FindIdPasswordResponse>('/api/v1/auth/reset-password', data);
        return response.data;
    },

    /**
     * BOJ 인증 코드 발급
     */
    issueBojCode: async (): Promise<BojCodeIssueResponse> => {
        const response = await apiClient.post<BojCodeIssueResponse>('/api/v1/auth/boj/code');
        return response.data;
    },

    /**
     * BOJ 인증 검증
     */
    verifyBoj: async (data: BojVerifyRequest): Promise<BojVerifyResponse> => {
        const response = await apiClient.post<BojVerifyResponse>('/api/v1/auth/boj/verify', data);
        return response.data;
    },

    /**
     * BOJ ID 중복 확인 (임시 구현 - 백엔드 API 구현 후 연결 필요)
     * @param bojId 확인할 BOJ ID
     * @returns 중복 여부 (true: 중복됨, false: 사용 가능)
     */
    checkIdDuplicate: async (bojId: string): Promise<boolean> => {
        // TODO: 백엔드 API 구현 후 실제 엔드포인트로 연결
        // 임시로 false 반환 (중복 아님)
        try {
            // 추후 구현: GET /api/v1/auth/check-boj-id/{bojId} 또는 POST /api/v1/auth/check-boj-id
            // const response = await apiClient.get(`/api/v1/auth/check-boj-id/${bojId}`);
            // return response.data.exists;
            return false;
        } catch (error: any) {
            // 409 에러가 발생하면 중복된 것으로 간주
            if (error.response?.status === 409) {
                return true;
            }
            // 기타 에러는 중복이 아닌 것으로 간주
            return false;
        }
    },
};

