/**
 * 크롤링 관련 API 엔드포인트
 * Resumable Crawling 기능 지원
 */

import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import type { CollectMetadataRequest, JobStartResponse, JobStatusResponse } from '../../types/api/admin.types';

export const crawlerApi = {
  /**
   * 문제 메타데이터 수집 시작 (비동기)
   * checkpoint가 있으면 자동으로 이어서 진행
   * POST 요청은 즉시 jobId를 반환하므로 timeout을 늘림
   */
  collectMetadata: async (params: CollectMetadataRequest): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/collect-metadata', null, {
      params,
      timeout: 60000, // 60초로 증가 (POST 요청이 백그라운드 작업을 시작하는 데 시간이 걸릴 수 있음)
    });
    return response.data;
  },

  /**
   * 메타데이터 수집 작업 상태 조회
   * GET 요청은 빠르므로 기본 timeout 사용
   */
  getMetadataCollectStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/collect-metadata/status/${jobId}`, {
        timeout: 10000, // 상태 조회는 빠르므로 10초면 충분
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null; // 작업을 찾을 수 없음 (24시간 후 자동 삭제)
      }
      throw error;
    }
  },

  /**
   * 문제 상세 정보 크롤링 시작 (비동기)
   * checkpoint가 있으면 자동으로 이어서 진행
   * POST 요청은 즉시 jobId를 반환하므로 timeout을 늘림
   */
  collectDetails: async (): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/collect-details', null, {
      timeout: 60000, // 60초로 증가
    });
    return response.data;
  },

  /**
   * 상세 정보 크롤링 작업 상태 조회
   * GET 요청은 빠르므로 기본 timeout 사용
   */
  getDetailsCollectStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/collect-details/status/${jobId}`, {
        timeout: 10000, // 상태 조회는 빠르므로 10초면 충분
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // 작업을 찾을 수 없음
      }
      throw error;
    }
  },

  /**
   * 문제 언어 정보 업데이트 시작 (비동기)
   * checkpoint가 있으면 자동으로 이어서 진행
   * POST 요청은 즉시 jobId를 반환하므로 timeout을 늘림
   */
  updateLanguage: async (): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/update-language', null, {
      timeout: 60000, // 60초로 증가
    });
    return response.data;
  },

  /**
   * 언어 정보 업데이트 작업 상태 조회
   * GET 요청은 빠르므로 기본 timeout 사용
   */
  getLanguageUpdateStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/update-language/status/${jobId}`, {
        timeout: 10000, // 상태 조회는 빠르므로 10초면 충분
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // 작업을 찾을 수 없음
      }
      throw error;
    }
  },
};
