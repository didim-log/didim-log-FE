/**
 * 인증 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import { LOGIN_DEBOUNCE_MS } from '../../utils/constants';
import type {
    SignupRequest,
    LoginRequest,
    SuperAdminRequest,
    AuthResponse,
    FindAccountRequest,
    FindAccountResponse,
    FindIdRequest,
    FindPasswordRequest,
    ResetPasswordRequest,
    FindIdPasswordResponse,
    BojCodeIssueResponse,
    BojVerifyRequest,
    BojVerifyResponse,
    BojIdDuplicateCheckResponse,
    RefreshTokenRequest,
    SignupFinalizeRequest,
} from '../../types/api/auth.types';

type InFlightLogin = {
    key: string;
    startedAt: number;
    promise: Promise<AuthResponse>;
};

let inFlightLogin: InFlightLogin | null = null;

const createLoginKey = (data: LoginRequest): string => {
    return `${data.bojId}:${data.password}`;
};

export const authApi = {
    /**
     * 회원가입
     */
    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },

    /**
     * 로그인
     * 
     * BOJ ID와 비밀번호로 로그인하고 JWT 토큰을 발급합니다.
     * 로그인 성공 시 Rate Limit이 초기화됩니다.
     * 
     * @param data 로그인 요청 데이터
     * @param data.bojId BOJ ID
     * @param data.password 비밀번호
     * @returns JWT 토큰 및 사용자 정보
     * 
     * @throws {AxiosError} 404 (STUDENT_NOT_FOUND): 가입되지 않은 BOJ ID
     * @throws {AxiosError} 400 (COMMON_INVALID_INPUT): 비밀번호 불일치 (remainingAttempts 포함)
     * @throws {AxiosError} 429 (RATE_LIMIT_EXCEEDED): Rate Limit 초과 (unlockTime 포함)
     * 
     * @see {@link https://github.com/didimlog/didim-log/blob/main/DOCS/API_SPECIFICATION.md#post-apiv1authlogin API 명세서}
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const key = createLoginKey(data);
        const now = Date.now();

        if (inFlightLogin && inFlightLogin.key === key && now - inFlightLogin.startedAt < LOGIN_DEBOUNCE_MS) {
            return await inFlightLogin.promise;
        }

        const promise = apiClient
            .post<AuthResponse>('/auth/login', data)
            .then((response) => response.data)
            .finally(() => {
                if (inFlightLogin?.promise === promise) {
                    inFlightLogin = null;
                }
            });

        inFlightLogin = { key, startedAt: now, promise };
        return await promise;
    },

    /**
     * 슈퍼 관리자 생성
     */
    createSuperAdmin: async (data: SuperAdminRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/super-admin', data);
        return response.data;
    },

    /**
     * 계정 찾기 (소셜 제공자 확인)
     */
    findAccount: async (data: FindAccountRequest): Promise<FindAccountResponse> => {
        const response = await apiClient.post<FindAccountResponse>('/auth/find-account', data);
        return response.data;
    },

    /**
     * 아이디 찾기
     */
    findId: async (data: FindIdRequest): Promise<FindIdPasswordResponse> => {
        const response = await apiClient.post<FindIdPasswordResponse>('/auth/find-id', data);
        return response.data;
    },

    /**
     * 비밀번호 찾기
     */
    findPassword: async (data: FindPasswordRequest): Promise<FindIdPasswordResponse> => {
        const response = await apiClient.post<FindIdPasswordResponse>('/auth/find-password', data);
        return response.data;
    },

    /**
     * 비밀번호 재설정
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<FindIdPasswordResponse> => {
        const response = await apiClient.post<FindIdPasswordResponse>('/auth/reset-password', data);
        return response.data;
    },

    /**
     * BOJ 인증 코드 발급
     */
    issueBojCode: async (): Promise<BojCodeIssueResponse> => {
        const response = await apiClient.post<BojCodeIssueResponse>('/auth/boj/code');
        return response.data;
    },

    /**
     * BOJ 인증 검증
     * 
     * 백준 프로필 상태 메시지에서 발급된 인증 코드를 확인하여 BOJ ID 소유권을 인증합니다.
     * 
     * @param data 인증 요청 데이터
     * @param data.sessionId 인증 코드 발급 시 받은 세션 ID
     * @param data.bojId 인증할 BOJ ID
     * @returns 인증 결과 및 인증된 BOJ ID
     * 
     * @throws {AxiosError} 404 (COMMON_RESOURCE_NOT_FOUND): 백준 프로필을 찾을 수 없음
     * @throws {AxiosError} 400 (COMMON_INVALID_INPUT): 프로필 접근 거부, 상태 메시지 없음, 또는 코드 불일치
     * 
     * @see {@link https://github.com/didimlog/didim-log/blob/main/DOCS/API_SPECIFICATION.md#post-apiv1authbojverify API 명세서}
     */
    verifyBoj: async (data: BojVerifyRequest): Promise<BojVerifyResponse> => {
        const response = await apiClient.post<BojVerifyResponse>('/auth/boj/verify', data);
        return response.data;
    },

    /**
     * BOJ ID 중복 확인
     * @param bojId 확인할 BOJ ID
     * @returns 중복 여부 (true: 중복됨, false: 사용 가능)
     * @throws AxiosError 404: BOJ ID를 찾을 수 없음, 기타 서버 에러
     */
    checkIdDuplicate: async (bojId: string): Promise<boolean> => {
        const response = await apiClient.get<BojIdDuplicateCheckResponse>('/auth/check-duplicate', {
            params: { bojId },
        });
        return response.data.isDuplicate;
    },

    /**
     * 토큰 갱신
     */
    refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
        return response.data;
    },

    /**
     * 회원가입 마무리 (소셜 로그인용)
     * 
     * 소셜 로그인 후 약관 동의 및 닉네임 설정을 완료합니다.
     * 신규 유저의 경우 Student 엔티티를 생성하고, 약관 동의가 완료되면 GUEST에서 USER로 역할이 변경되며 정식 Access Token이 발급됩니다.
     * 
     * @param data 회원가입 마무리 요청 데이터
     * @returns JWT 토큰 및 사용자 정보
     * 
     * @throws {AxiosError} 400 (COMMON_INVALID_INPUT): 약관 동의 미완료, 닉네임 중복 등
     * @throws {AxiosError} 409 (DUPLICATE_BOJ_ID): 이미 가입된 BOJ ID
     * 
     * @see {@link https://github.com/didimlog/didim-log/blob/main/DOCS/API_SPECIFICATION.md#post-apiv1authsignupfinalize API 명세서}
     */
    signupFinalize: async (data: SignupFinalizeRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signup/finalize', data);
        return response.data;
    },
};
