/**
 * 크롤링 관련 API 엔드포인트
 * Resumable Crawling 기능 지원
 */

import type { AxiosError } from 'axios';
import { apiClient } from '../client';
import type {
  CollectMetadataRequest,
  JobListRequest,
  JobListResponse,
  JobMetricsWindow,
  JobMetricsResponse,
  JobStatusResponse,
  ProblemJobAuditPageResponse,
  RefreshDetailsRequest,
  JobStartResponse,
} from '../../types/api/admin.types';

export const crawlerApi = {
  getJobStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/jobs/${jobId}`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getJobs: async (params: JobListRequest = {}): Promise<JobListResponse> => {
    const response = await apiClient.get<JobListResponse>('/admin/problems/jobs', { params, timeout: 10000 });
    return response.data;
  },

  cancelJob: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await apiClient.post<JobStatusResponse>(`/admin/problems/jobs/${jobId}/cancel`, null, {
      timeout: 10000,
    });
    return response.data;
  },

  retryJob: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await apiClient.post<JobStatusResponse>(`/admin/problems/jobs/${jobId}/retry`, null, {
      timeout: 10000,
    });
    return response.data;
  },

  getJobMetrics: async (window: JobMetricsWindow = 'DAY'): Promise<JobMetricsResponse> => {
    const response = await apiClient.get<JobMetricsResponse>('/admin/problems/jobs/metrics', {
      params: { window },
      timeout: 10000,
    });
    return response.data;
  },

  getJobAudit: async (params: JobListRequest = {}): Promise<ProblemJobAuditPageResponse> => {
    const response = await apiClient.get<ProblemJobAuditPageResponse>('/admin/problems/jobs/audit', {
      params,
      timeout: 10000,
    });
    return response.data;
  },

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
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
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
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 문제 상세 정보 강제 재수집 시작 (비동기)
   * 기존 수집 여부와 무관하게 상세 정보를 강제로 다시 수집
   * 범위를 지정하면 해당 문제 ID 범위만 재수집
   */
  refreshDetails: async (params?: RefreshDetailsRequest): Promise<JobStartResponse> => {
    const response = await apiClient.post<JobStartResponse>('/admin/problems/refresh-details', null, {
      params,
      timeout: 60000, // 60초로 증가
    });
    return response.data;
  },

  /**
   * 상세 정보 강제 재수집 작업 상태 조회
   */
  getRefreshDetailsStatus: async (jobId: string): Promise<JobStatusResponse | null> => {
    try {
      const response = await apiClient.get<JobStatusResponse>(`/admin/problems/refresh-details/status/${jobId}`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
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
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
