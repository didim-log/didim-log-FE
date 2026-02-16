/**
 * 템플릿 관련 API 엔드포인트
 */

import { apiClient } from '../client';
import type {
    Template,
    TemplateSummary,
    TemplateRenderResponse,
    TemplateRenderRequest,
    TemplatePreviewRequest,
    TemplateCreateRequest,
    TemplateUpdateRequest,
    TemplateSectionPreset,
    TemplateDefaultCategory,
} from '../../types/api/template.types';

const TEMPLATE_RENDER_TIMEOUT_MS = 12000;

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
        const requestBody: TemplateRenderRequest = {
            problemId,
            programmingLanguage: options?.programmingLanguage ?? null,
            code: options?.code ?? null,
        };

        const response = await apiClient.post<TemplateRenderResponse>(
            `/templates/${templateId}/render`,
            requestBody,
            { timeout: TEMPLATE_RENDER_TIMEOUT_MS }
        );
        return response.data;
    },

    /**
     * 템플릿 미리보기
     * 저장하지 않고 템플릿을 미리보기합니다.
     */
    previewTemplate: async (data: TemplatePreviewRequest): Promise<TemplateRenderResponse> => {
        const response = await apiClient.post<TemplateRenderResponse>(
            '/templates/preview',
            data,
            { timeout: TEMPLATE_RENDER_TIMEOUT_MS }
        );
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
        const response = await apiClient.put<Template>(
            `/templates/${templateId}/default?category=${category}`
        );
        return response.data;
    },

};
