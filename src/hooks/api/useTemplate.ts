/**
 * 템플릿 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../../api/endpoints/template.api';
import type {
    Template,
    TemplateSummary,
    TemplateDefaultCategory,
    TemplatePreviewRequest,
    TemplateCreateRequest,
    TemplateUpdateRequest,
} from '../../types/api/template.types';
import { useAuthStore } from '../../stores/auth.store';

/**
 * 템플릿 목록 조회
 */
export const useTemplates = () => {
    const { token } = useAuthStore();

    return useQuery({
        queryKey: ['templates'],
        queryFn: () => templateApi.getTemplates(),
        enabled: !!token,
        staleTime: 5 * 60 * 1000, // 5분
    });
};

/**
 * 템플릿 요약 목록 조회 (content 제외)
 */
export const useTemplateSummaries = () => {
    const { token } = useAuthStore();
    return useQuery({
        queryKey: ['templates', 'summaries'],
        queryFn: () => templateApi.getTemplateSummaries(),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * 섹션 프리셋 목록 조회
 */
export const usePresets = () => {
    const { token } = useAuthStore();

    return useQuery({
        queryKey: ['templates', 'presets'],
        queryFn: () => templateApi.getPresets(),
        enabled: !!token,
        staleTime: 10 * 60 * 1000, // 10분
    });
};

/**
 * 템플릿 렌더링
 */
export const useRenderTemplate = () => {
    return useMutation({
        mutationFn: ({
            templateId,
            problemId,
            programmingLanguage,
            code,
        }: {
            templateId: string;
            problemId: number;
            programmingLanguage?: string | null;
            code?: string | null;
        }) =>
            templateApi.renderTemplate(templateId, problemId, {
                programmingLanguage,
                code,
            }),
    });
};

/**
 * 템플릿 미리보기
 */
export const usePreviewTemplate = () => {
    return useMutation({
        mutationFn: (data: TemplatePreviewRequest) => templateApi.previewTemplate(data),
    });
};

/**
 * 템플릿 생성
 */
export const useCreateTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TemplateCreateRequest) => templateApi.createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};

/**
 * 템플릿 수정
 */
export const useUpdateTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, data }: { templateId: string; data: TemplateUpdateRequest }) =>
            templateApi.updateTemplate(templateId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};

/**
 * 템플릿 삭제
 */
export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => templateApi.deleteTemplate(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};

/**
 * 템플릿 기본값 설정
 */
export const useSetDefaultTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ templateId, category }: { templateId: string; category: TemplateDefaultCategory }) =>
            templateApi.setDefaultTemplate(templateId, category),
        onSuccess: (_, variables) => {
            const normalizedCategory = variables.category === 'FAILURE' ? 'FAIL' : variables.category;
            queryClient.setQueryData<Template[]>(['templates'], (current) => {
                if (!current) {
                    return current;
                }
                return current.map((template) => {
                    if (normalizedCategory === 'SUCCESS') {
                        return {
                            ...template,
                            isDefaultSuccess: template.id === variables.templateId,
                        };
                    }
                    return {
                        ...template,
                        isDefaultFail: template.id === variables.templateId,
                    };
                });
            });
            queryClient.setQueryData<TemplateSummary[]>(['templates', 'summaries'], (current) => {
                if (!current) {
                    return current;
                }
                return current.map((template) => {
                    if (normalizedCategory === 'SUCCESS') {
                        return {
                            ...template,
                            isDefaultSuccess: template.id === variables.templateId,
                        };
                    }
                    return {
                        ...template,
                        isDefaultFail: template.id === variables.templateId,
                    };
                });
            });
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['templates', 'summaries'] });
        },
    });
};

/**
 * 카테고리별 기본 템플릿 조회
 */
export const useDefaultTemplate = (category: 'SUCCESS' | 'FAIL') => {
    const { token } = useAuthStore();
    return useQuery({
        queryKey: ['templates', 'default', category],
        queryFn: () => templateApi.getDefaultTemplate(category),
        enabled: !!token,
        staleTime: 5 * 60 * 1000, // 5분
    });
};
