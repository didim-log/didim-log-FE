/**
 * 템플릿 관리 탭 컴포넌트
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { FileText, Edit2, Trash2, Plus, ChevronUp, Eye, MoreVertical } from 'lucide-react';
import Card from '../common/Card';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { toastApiError } from '../../utils/toastApiError';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useSetDefaultTemplate } from '../../hooks/api/useTemplate';
import { Spinner } from '../ui/Spinner';
import type { Template, TemplateCreateRequest } from '../../types/api/template.types';
import { MarkdownViewer } from '../common/MarkdownViewer';
import { TemplateBlockBuilder } from './TemplateBlockBuilder';

/**
 * 템플릿 미리보기용 플레이스홀더 변환 함수
 * 프로그래밍 키워드를 사용자 친화적인 텍스트로 변환
 * 모든 템플릿(시스템 요약, 상세, 커스텀)의 제목을 통일하여 표시
 */
const replacePlaceholdersForPreview = (content: string): string => {
    let result = content
        .replace(/\{\{problemId\}\}/g, '문제 번호')
        .replace(/\{\{problemTitle\}\}/g, '문제 제목')
        .replace(/\{\{language\}\}/g, '언어')
        .replace(/\{\{result\}\}/g, '결과')
        // 티어는 "문제 티어"로 표시
        .replace(/\{\{tier\}\}/g, '문제 티어')
        .replace(/\{\{link\}\}/g, '문제 링크')
        .replace(/\{\{timeTaken\}\}/g, '풀이 시간');
    
    // 모든 제목 라인을 통일된 형식으로 변경
    // 첫 번째 헤더(# 또는 ##)를 찾아서 "🏆 회고 제목"으로 통일
    // 첫 번째 줄에 있는 헤더만 변경
    const lines = result.split('\n');
    if (lines.length > 0) {
        const firstLine = lines[0];
        // 첫 번째 줄이 헤더인 경우에만 변경
        const headerMatch = firstLine.match(/^(#{1,2})\s+(.+)$/);
        if (headerMatch) {
            const headerLevel = headerMatch[1];
            lines[0] = `${headerLevel} 🏆 회고 제목`;
            result = lines.join('\n');
        }
    }
    
    // 추가로 "해결 회고" 또는 "미해결 회고"가 있는 경우도 처리 (전체 파일에서)
    result = result.replace(/^(#{1,2}\s*[^#\n]*?)(해결\s*회고|미해결\s*회고)(.*)$/gm, (match) => {
        const headerLevel = match.match(/^#{1,2}/)?.[0] || '#';
        return `${headerLevel} 🏆 회고 제목`;
    });
    
    // "제출한 코드" 섹션에 코드 블록이 있는지 확인하고 없으면 추가
    // 커스텀 템플릿과 동일한 스타일로 코드 블록을 보장
    // 모든 "## 제출한 코드" 또는 "# 제출한 코드" 패턴 찾기
    const codeSectionHeaderPattern = /(##?\s*제출한\s*코드)(\s*\n)/gi;
    const codeSectionMatches = [...result.matchAll(codeSectionHeaderPattern)];
    
    if (codeSectionMatches.length > 0) {
        // 각 "제출한 코드" 섹션을 역순으로 처리 (인덱스 문제 방지)
        for (let i = codeSectionMatches.length - 1; i >= 0; i--) {
            const match = codeSectionMatches[i];
            const headerStartIndex = match.index || 0;
            const headerEndIndex = headerStartIndex + match[0].length;
            
            // 헤더 다음 부분 추출 (다음 섹션 헤더, 구분선, 문서 끝까지)
            const afterHeader = result.substring(headerEndIndex);
            const nextSectionMatch = afterHeader.match(/(?=\n##?\s+[^#\n]|\n---|\n\*\*[^*]|\n\[문제 링크\]|$)/);
            const sectionEndIndex = nextSectionMatch 
                ? headerEndIndex + (nextSectionMatch.index || 0)
                : result.length;
            
            const sectionContent = result.substring(headerEndIndex, sectionEndIndex);
            
            // 코드 블록이 있는지 확인 (```로 시작하고 끝나는 블록)
            const hasCodeBlock = /```[\s\S]*?```/.test(sectionContent);
            
            // 코드 블록이 없는 경우 무조건 추가
            if (!hasCodeBlock) {
                const codeBlock = '\n```kotlin\n여기에 코드를 작성하세요.\n```\n\n';
                // 기존 내용 제거하고 코드 블록 추가
                result = result.substring(0, headerEndIndex) + codeBlock + result.substring(sectionEndIndex);
            } else {
                // 코드 블록이 있지만 일반 텍스트가 섞여 있는 경우 정리
                // "여기에 코드를 작성하세요" 같은 플레이스홀더 텍스트가 코드 블록 외부에 있으면 제거
                const lines = sectionContent.split('\n');
                const codeBlockStartIndex = lines.findIndex(line => line.trim().startsWith('```'));
                const codeBlockEndIndex = lines.findIndex((line, idx) => 
                    idx > codeBlockStartIndex && line.trim().endsWith('```')
                );
                
                if (codeBlockStartIndex >= 0 && codeBlockEndIndex >= 0) {
                    // 코드 블록 내부는 유지, 외부 플레이스홀더 텍스트는 제거
                    const beforeCodeBlock = lines.slice(0, codeBlockStartIndex).join('\n');
                    const codeBlockLines = lines.slice(codeBlockStartIndex, codeBlockEndIndex + 1);
                    const afterCodeBlock = lines.slice(codeBlockEndIndex + 1).join('\n');
                    
                    // 플레이스홀더 텍스트가 코드 블록 외부에 있으면 제거
                    const cleanBefore = beforeCodeBlock.replace(/여기에 코드를 작성하세요[^\n]*/gi, '').trim();
                    const cleanAfter = afterCodeBlock.replace(/여기에 코드를 작성하세요[^\n]*/gi, '').trim();
                    
                    const cleanedContent = [cleanBefore, ...codeBlockLines, cleanAfter]
                        .filter(line => line.trim())
                        .join('\n');
                    
                    if (cleanedContent !== sectionContent) {
                        result = result.substring(0, headerEndIndex) + '\n' + cleanedContent + '\n\n' + result.substring(sectionEndIndex);
                    }
                }
            }
        }
    }
    
    return result;
};

export const TemplateManagementTab: FC = () => {
    const { data: templates, isLoading } = useTemplates();
    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate();
    const deleteMutation = useDeleteTemplate();
    const setDefaultMutation = useSetDefaultTemplate();

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const [formData, setFormData] = useState<TemplateCreateRequest>({
        title: '',
        content: '',
    });

    const {
        customTemplates,
        systemTemplates,
        defaultSuccessTemplate,
        defaultFailTemplate,
        simpleTemplate,
        detailTemplate,
    } = useMemo(() => {
        const templateList = templates || [];
        const system = templateList.filter((template) => template.type === 'SYSTEM');
        return {
            customTemplates: templateList.filter((template) => template.type === 'CUSTOM'),
            systemTemplates: system,
            defaultSuccessTemplate: templateList.find((template) => template.isDefaultSuccess) || null,
            defaultFailTemplate: templateList.find((template) => template.isDefaultFail) || null,
            simpleTemplate: system.find((template) =>
                template.title.toLowerCase().includes('simple') || template.title.includes('요약')
            ),
            detailTemplate: system.find((template) =>
                template.title.toLowerCase().includes('detail') || template.title.includes('상세')
            ),
        };
    }, [templates]);

    // 드롭다운 외부 클릭 시 닫기 (모든 훅은 early return 전에 호출되어야 함)
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        if (openDropdownId) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]);

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({ title: '', content: '' });
        setIsBuilderOpen(true);
    };

    const handleEdit = (template: Template) => {
        if (template.type === 'SYSTEM') {
            toast.error('시스템 템플릿은 수정할 수 없습니다.');
            return;
        }
        setEditingTemplate(template);
        setFormData({
            title: template.title,
            content: template.content,
        });
        setIsBuilderOpen(true);
    };

    const handleDelete = async (template: Template) => {
        if (template.type === 'SYSTEM') {
            toast.error('시스템 템플릿은 삭제할 수 없습니다.');
            return;
        }

        if (!window.confirm(`"${template.title}" 템플릿을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // 삭제 전에 기본 템플릿인지 확인
            const isSuccessDefault = defaultSuccessTemplate?.id === template.id;
            const isFailDefault = defaultFailTemplate?.id === template.id;

            await deleteMutation.mutateAsync(template.id);
            toast.success('템플릿이 삭제되었습니다.');

            // 삭제된 템플릿이 기본 템플릿이었던 경우, Detail 템플릿을 자동으로 설정
            if ((isSuccessDefault || isFailDefault) && detailTemplate) {
                try {
                    // 성공 회고 기본값이 삭제된 경우
                    if (isSuccessDefault) {
                        await setDefaultMutation.mutateAsync({
                            templateId: detailTemplate.id,
                            category: 'SUCCESS',
                        });
                    }
                    // 실패 회고 기본값이 삭제된 경우
                    if (isFailDefault) {
                        await setDefaultMutation.mutateAsync({
                            templateId: detailTemplate.id,
                            category: 'FAIL',
                        });
                    }
                    toast.success('기본 템플릿이 "Detail(상세)"로 자동 설정되었습니다.');
                } catch (error) {
                    console.error('기본 템플릿 자동 설정 실패:', error);
                    // 자동 설정 실패는 조용히 처리 (템플릿 삭제는 이미 성공)
                }
            }
        } catch {
            toast.error('템플릿 삭제에 실패했습니다.');
        }
    };

    const handleSetDefault = async (templateId: string, category: 'SUCCESS' | 'FAIL') => {
        try {
            await setDefaultMutation.mutateAsync({ templateId, category });
            toast.success(`${category === 'SUCCESS' ? '성공' : '실패'} 기본 템플릿으로 설정되었습니다.`);
        } catch (error: unknown) {
            console.error('기본 템플릿 설정 실패:', error);
            // Axios 에러인 경우 상세 정보 로그 출력
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
                console.error('에러 응답:', axiosError.response?.data);
                console.error('HTTP 상태 코드:', axiosError.response?.status);
            }
            toastApiError(error, '기본 템플릿 설정에 실패했습니다.');
        }
    };


    const handleSave = async (
        markdown: string,
        options?: { defaultMode?: 'NONE' | 'SUCCESS' | 'FAIL' | 'BOTH' }
    ) => {
        if (!formData.title.trim()) {
            toast.error('템플릿 이름을 입력해주세요.');
            return;
        }

        // 저장 시점의 최신 markdown 사용
        const finalContent = markdown || formData.content;

        if (!finalContent || !finalContent.trim() || finalContent.length < 10) {
            toast.error('템플릿 내용은 최소 10자 이상이어야 합니다.');
            return;
        }

        if (finalContent.length > 10000) {
            toast.error('템플릿 내용은 최대 10000자까지 작성할 수 있습니다.');
            return;
        }

        try {
            let savedTemplateId: string;
            
            const saveData = {
                title: formData.title.trim(),
                content: finalContent.trim(),
            };
            
            if (editingTemplate) {
                const updated = await updateMutation.mutateAsync({
                    templateId: editingTemplate.id,
                    data: saveData,
                });
                savedTemplateId = updated.id;
                toast.success('템플릿이 수정되었습니다.');
            } else {
                const created = await createMutation.mutateAsync(saveData);
                savedTemplateId = created.id;
                toast.success('템플릿이 생성되었습니다.');
            }

            const defaultMode = options?.defaultMode ?? 'NONE';

            // 기본값으로 설정하는 경우
            if (defaultMode !== 'NONE') {
                // BOTH인 경우 성공과 실패 둘 다에 대해 기본 템플릿 설정
                if (defaultMode === 'BOTH') {
                    let successSet = false;
                    let failSet = false;
                    let successError: unknown = null;
                    let failError: unknown = null;

                    // 성공 회고 기본 템플릿 설정
                    try {
                        await setDefaultMutation.mutateAsync({
                            templateId: savedTemplateId,
                            category: 'SUCCESS',
                        });
                        successSet = true;
                    } catch (error) {
                        console.error('성공 회고 기본 템플릿 설정 실패:', error);
                        successError = error;
                    }

                    // 실패 회고 기본 템플릿 설정
                    try {
                        await setDefaultMutation.mutateAsync({
                            templateId: savedTemplateId,
                            category: 'FAIL',
                        });
                        failSet = true;
                    } catch (error) {
                        console.error('실패 회고 기본 템플릿 설정 실패:', error);
                        failError = error;
                    }

                    // 결과 메시지
                    if (successSet && failSet) {
                        toast.success('성공 및 실패 기본 템플릿으로 설정되었습니다.');
                    } else if (successSet) {
                        toast.warning('성공 기본 템플릿으로 설정되었습니다. 실패 기본 템플릿 설정에 실패했습니다.');
                    } else if (failSet) {
                        toast.warning('실패 기본 템플릿으로 설정되었습니다. 성공 기본 템플릿 설정에 실패했습니다.');
                    } else {
                        toast.error('기본 템플릿 설정에 실패했습니다.');
                        console.error('성공 회고 설정 오류:', successError);
                        console.error('실패 회고 설정 오류:', failError);
                    }
                } else {
                    // SUCCESS 또는 FAIL 중 하나만 설정
                    try {
                        await setDefaultMutation.mutateAsync({
                            templateId: savedTemplateId,
                            category: defaultMode,
                        });
                        toast.success(`${defaultMode === 'SUCCESS' ? '성공' : '실패'} 기본 템플릿으로 설정되었습니다.`);
                    } catch (error) {
                        console.error('기본 템플릿 설정 실패:', error);
                        toast.error('기본 템플릿 설정에 실패했습니다.');
                    }
                }
            }

            setIsBuilderOpen(false);
            setEditingTemplate(null);
            setFormData({ title: '', content: '' });
        } catch (error) {
            console.error('템플릿 저장 실패:', error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            toast.error(`${editingTemplate ? '템플릿 수정' : '템플릿 생성'}에 실패했습니다: ${errorMessage}`);
        }
    };

    const handleCloseBuilder = useCallback(() => {
        setIsBuilderOpen(false);
        setEditingTemplate(null);
        setFormData({ title: '', content: '' });
    }, []);

    const handleMarkdownChange = useCallback((content: string) => {
        setFormData((prev) => ({ ...prev, content }));
    }, []);

    const handleTemplateTitleChange = useCallback((title: string) => {
        setFormData((prev) => ({ ...prev, title }));
    }, []);

    if (isLoading) {
        return (
            <Card>
                <div className="flex items-center justify-center py-12">
                    <Spinner />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">템플릿을 불러오는 중...</span>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* 템플릿 관리 헤더 */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                회고 템플릿 관리
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                회고 작성 시 사용할 템플릿을 관리합니다.
                            </p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        새 템플릿 만들기
                    </Button>
                </div>


                {/* 기본 템플릿 정보 - 개선된 UI */}
                <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">현재 적용된 기본 템플릿</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">성공 회고</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {defaultSuccessTemplate?.title || (simpleTemplate?.title || 'Simple(요약)')}
                                </span>
                                {(defaultSuccessTemplate?.type === 'SYSTEM' || !defaultSuccessTemplate) && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                        {!defaultSuccessTemplate ? '시스템 (기본값)' : '시스템'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">실패 회고</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 text-lg">✓</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {defaultFailTemplate?.title || (detailTemplate?.title || 'Detail(상세)')}
                                </span>
                                {(defaultFailTemplate?.type === 'SYSTEM' || !defaultFailTemplate) && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                        {!defaultFailTemplate ? '시스템 (기본값)' : '시스템'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        💡 기본 템플릿이 설정되지 않은 경우 성공은 "Simple(요약)", 실패는 "Detail(상세)" 시스템 템플릿이 사용됩니다.
                    </p>
                </div>

                {/* 커스텀 템플릿 목록 */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        내 템플릿 ({customTemplates.length})
                    </h3>
                    {customTemplates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>아직 생성한 템플릿이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customTemplates.map((template) => {
                                const isExpanded = expandedTemplateId === template.id;
                                const isSuccessDefault = defaultSuccessTemplate?.id === template.id;
                                const isFailDefault = defaultFailTemplate?.id === template.id;
                                
                                return (
                                    <div
                                        key={template.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                        {template.title}
                                                    </h4>
                                                    {isSuccessDefault && !isFailDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                                            [성공 기본]
                                                        </span>
                                                    )}
                                                    {isFailDefault && !isSuccessDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                                                            [실패 기본]
                                                        </span>
                                                    )}
                                                    {isSuccessDefault && isFailDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                                            [공용 기본]
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {new Date(template.updatedAt).toLocaleDateString('ko-KR')} 수정
                                                </p>
                                                
                                                {/* 마크다운 미리보기 (확장 가능) */}
                                                {isExpanded && (
                                                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                        <div className="prose dark:prose-invert max-w-none">
                                                            <MarkdownViewer content={replacePlaceholdersForPreview(template.content)} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title={isExpanded ? '접기' : '마크다운 미리보기'}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(template)}
                                                    title="수정"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(template)}
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                {/* 설정 드롭다운 */}
                                                <div className="relative" ref={openDropdownId === template.id ? dropdownRef : null}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenDropdownId(openDropdownId === template.id ? null : template.id)}
                                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="설정"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    {openDropdownId === template.id && (
                                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                                            <div className="py-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleSetDefault(template.id, 'SUCCESS');
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                                        isSuccessDefault ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    {isSuccessDefault ? '✓ ' : ''}성공 회고 기본값으로 설정
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleSetDefault(template.id, 'FAIL');
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                                        isFailDefault ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    {isFailDefault ? '✓ ' : ''}실패 회고 기본값으로 설정
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 시스템 템플릿 목록 */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        시스템 템플릿 ({systemTemplates.length})
                    </h3>
                    {systemTemplates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>시스템 템플릿이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {systemTemplates.map((template) => {
                                const isExpanded = expandedTemplateId === template.id;
                                const isSuccessDefault = defaultSuccessTemplate?.id === template.id;
                                const isFailDefault = defaultFailTemplate?.id === template.id;
                                
                                return (
                                    <div
                                        key={template.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                        {template.title}
                                                    </h4>
                                                    {isSuccessDefault && !isFailDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                                            [성공 기본]
                                                        </span>
                                                    )}
                                                    {isFailDefault && !isSuccessDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                                                            [실패 기본]
                                                        </span>
                                                    )}
                                                    {isSuccessDefault && isFailDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                                            [공용 기본]
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* 마크다운 미리보기 (확장 가능) */}
                                                {isExpanded && (
                                                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                        <div className="prose dark:prose-invert max-w-none">
                                                            <MarkdownViewer content={replacePlaceholdersForPreview(template.content)} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title={isExpanded ? '접기' : '마크다운 미리보기'}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                {/* 시스템 템플릿도 기본값 설정 가능 */}
                                                <div className="relative" ref={openDropdownId === template.id ? dropdownRef : null}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenDropdownId(openDropdownId === template.id ? null : template.id)}
                                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="설정"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    {openDropdownId === template.id && (
                                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                                            <div className="py-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleSetDefault(template.id, 'SUCCESS');
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                                        isSuccessDefault ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    {isSuccessDefault ? '✓ ' : ''}성공 회고 기본값으로 설정
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleSetDefault(template.id, 'FAIL');
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                                        isFailDefault ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    {isFailDefault ? '✓ ' : ''}실패 회고 기본값으로 설정
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            {/* 블록 빌더 모달 */}
            {isBuilderOpen && (
                <TemplateBlockBuilder
                    initialMarkdown={editingTemplate?.content || ''}
                    templateTitle={formData.title}
                    onTemplateTitleChange={handleTemplateTitleChange}
                    onMarkdownChange={handleMarkdownChange}
                    onClose={handleCloseBuilder}
                    onSave={handleSave}
                    isSaving={createMutation.isPending || updateMutation.isPending}
                />
            )}

        </div>
    );
};
