/**
 * 크롤링 관련 API 엔드포인트
 * Resumable Crawling 기능 지원
 */

import { apiClient } from '../client';
import type { CollectMetadataRequest, JobStartResponse, JobStatusResponse } from '../../types/api/admin.types';

export const crawlerApi = {
  /**
   * 문제 메타데이터 수집 시작 (비동기)
   * checkpoint가 있으면 자동으로 이어서 진행
   */
  collectMetadata: async (params: CollectMetadataRequest): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/collect-metadata', null, { params });
    return response.data;
  },

  /**
   * 메타데이터 수집 작업 상태 조회
   */
  getMetadataCollectStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/collect-metadata/status/${jobId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // 작업을 찾을 수 없음 (24시간 후 자동 삭제)
      }
      throw error;
    }
  },

  /**
   * 문제 상세 정보 크롤링 시작 (비동기)
   * checkpoint가 있으면 자동으로 이어서 진행
   */
  collectDetails: async (): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/collect-details');
    return response.data;
  },

  /**
   * 상세 정보 크롤링 작업 상태 조회
   */
  getDetailsCollectStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/collect-details/status/${jobId}`);
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
   */
  updateLanguage: async (): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/update-language');
    return response.data;
  },

  /**
   * 언어 정보 업데이트 작업 상태 조회
   */
  getLanguageUpdateStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/update-language/status/${jobId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // 작업을 찾을 수 없음
      }
      throw error;
    }
  },
};
