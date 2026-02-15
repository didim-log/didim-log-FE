/**
 * 템플릿 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    Template,
    TemplateSummary,
    TemplateRenderResponse,
    TemplatePreviewRequest,
    TemplateCreateRequest,
    TemplateUpdateRequest,
    TemplateSectionPreset,
    TemplateDefaultCategory,
} from '../../types/api/template.types';

const normalizeDefaultCategory = (category: TemplateDefaultCategory): 'SUCCESS' | 'FAIL' => {
    return category === 'FAILURE' ? 'FAIL' : category;
};

export const templateApi = {
    /**
     * 템플릿 목록 조회
     * 커스텀 템플릿과 시스템 템플릿을 모두 반환합니다.
     */
    getTemplates: async (): Promise<Template[]> => {
        const response = await apiClient.get<Template[]>('/templates');
        return response.data;
    },

    /**
     * 템플릿 요약 목록 조회
     * content를 제외한 경량 목록을 반환합니다.
     */
    getTemplateSummaries: async (): Promise<TemplateSummary[]> => {
        const response = await apiClient.get<TemplateSummary[]>('/templates/summaries');
        return response.data;
    },

    /**
     * 섹션 프리셋 목록 조회
     * 커스텀 템플릿 작성 시 활용할 수 있는 추천 섹션 목록을 반환합니다.
     */
    getPresets: async (): Promise<TemplateSectionPreset[]> => {
        const response = await apiClient.get<TemplateSectionPreset[]>('/templates/presets');
        return response.data;
    },

    /**
     * 템플릿 렌더링
     * 저장된 템플릿을 문제 데이터와 결합하여 렌더링합니다.
     */
    renderTemplate: async (
        templateId: string,
        problemId: number,
        options?: {
            programmingLanguage?: string | null;
            code?: string | null;
        }
    ): Promise<TemplateRenderResponse> => {
        const params = new URLSearchParams({
            problemId: problemId.toString(),
        });
        
        if (options?.programmingLanguage) {
            params.append('programmingLanguage', options.programmingLanguage);
        }
        
        if (options?.code) {
            params.append('code', options.code);
        }
        
        const response = await apiClient.get<TemplateRenderResponse>(
            `/templates/${templateId}/render?${params.toString()}`
        );
        return response.data;
    },

    /**
     * 템플릿 미리보기
     * 저장하지 않고 템플릿을 미리보기합니다.
     */
    previewTemplate: async (data: TemplatePreviewRequest): Promise<TemplateRenderResponse> => {
        const response = await apiClient.post<TemplateRenderResponse>('/templates/preview', data);
        return response.data;
    },

    /**
     * 템플릿 생성
     */
    createTemplate: async (data: TemplateCreateRequest): Promise<Template> => {
        const response = await apiClient.post<Template>('/templates', data);
        return response.data;
    },

    /**
     * 템플릿 수정
     */
    updateTemplate: async (templateId: string, data: TemplateUpdateRequest): Promise<Template> => {
        const response = await apiClient.put<Template>(`/templates/${templateId}`, data);
        return response.data;
    },

    /**
     * 템플릿 삭제
     */
    deleteTemplate: async (templateId: string): Promise<void> => {
        await apiClient.delete(`/templates/${templateId}`);
    },

    /**
     * 템플릿 기본값 설정
     * @param templateId 템플릿 ID
     * @param category SUCCESS | FAIL
     */
    setDefaultTemplate: async (templateId: string, category: TemplateDefaultCategory): Promise<Template> => {
        const normalizedCategory = normalizeDefaultCategory(category);
        const response = await apiClient.put<Template>(
            `/templates/${templateId}/default?category=${normalizedCategory}`
        );
        return response.data;
    },

    /**
     * 카테고리별 기본 템플릿 조회
     * @param category SUCCESS | FAIL
     */
    getDefaultTemplate: async (category: TemplateDefaultCategory): Promise<Template | null> => {
        const normalizedCategory = normalizeDefaultCategory(category);
        try {
            const response = await apiClient.get<Template>(`/templates/default?category=${normalizedCategory}`);
            return response.data;
        } catch (error: unknown) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * 카테고리별 기본 템플릿 조회(요약)
     * 404면 null 반환, 그 외 에러는 상위로 전달합니다.
     */
    getDefaultTemplateSummary: async (category: TemplateDefaultCategory): Promise<TemplateSummary | null> => {
        const normalizedCategory = normalizeDefaultCategory(category);
        try {
            const response = await apiClient.get<TemplateSummary>(`/templates/default?category=${normalizedCategory}`);
            return response.data;
        } catch (error: unknown) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                return null;
            }
            throw error;
        }
    },
};
