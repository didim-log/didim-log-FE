/**
 * 블록형 템플릿 빌더 컴포넌트
 * 백엔드 리팩토링 반영: Mock Data 제거, 리얼 미리보기, 스마트 섹션 삽입
 */

import { useState, useMemo, useCallback, useEffect, memo, useRef } from 'react';
import type { FC } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { MarkdownViewer } from '../common/MarkdownViewer';
import { toast } from 'sonner';
import { usePresets } from '../../hooks/api/useTemplate';
import type { TemplateCategory } from '../../types/api/template.types';
import {
    convertBlocksToMarkdown,
    parseMarkdownToBlocks,
} from './templateBlockConverter';
import type { TemplateBlock } from './templateBlockConverter';
import { Spinner } from '../ui/Spinner';
import { SCROLL_DELAY_MS } from '../../utils/constants';
import { measureInputLatency } from '../../utils/performanceProfiler';

/**
 * 제목 초기값 포맷 상수
 */
const DEFAULT_TITLE_FORMAT = '# 🏆 [백준/BOJ] {{problemId}}번 {{problemTitle}} ({{language}}) {{result}} 회고';

/**
 * 제목 블록의 표시용 텍스트
 */
const TITLE_DISPLAY_TEXT = '회고 제목';

/**
 * 미리보기용 제목 포맷 (간소화된 형식)
 * 프로필 페이지 미리보기에서는 성공/실패 여부와 관계없이 중립적인 텍스트 사용
 */
const PREVIEW_TITLE_FORMAT = '# 🏆 회고 제목';
const SECTION_EMOJI_REGEX = /(?:💡|🧐|⏱️|🎯|✨|📝|🔑|🆚|🛠️|📚|🐛|🧪|🔧|🔗|💬)\s*/gu;
const SECTION_NUMBER_PREFIX_REGEX = /^\d+\.\s*/;

const removeSectionEmoji = (title: string): string => title.replace(SECTION_EMOJI_REGEX, '').trim();
const normalizeSectionTitle = (title: string): string => removeSectionEmoji(title.replace(SECTION_NUMBER_PREFIX_REGEX, ''));

interface TemplateBlockBuilderProps {
    initialMarkdown?: string;
    templateTitle: string;
    onTemplateTitleChange: (title: string) => void;
    onMarkdownChange: (markdown: string) => void;
    onClose: () => void;
    onSave: (
        markdown: string,
        options?: { defaultMode?: 'NONE' | TemplateCategory | 'BOTH' }
    ) => void;
    isSaving?: boolean;
}

/**
 * 정렬 가능한 블록 카드 컴포넌트
 */
interface SortableBlockCardProps {
    block: TemplateBlock;
    index: number;
    onUpdate: (id: string, updates: Partial<TemplateBlock>) => void;
    onDelete: (id: string) => void;
}

const SortableBlockCard: FC<SortableBlockCardProps> = memo(({
    block,
    index,
    onUpdate,
    onDelete,
}) => {
    const isFirstBlock = index === 0;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
        disabled: isFirstBlock,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-md transition-all ${
                isDragging ? 'shadow-lg scale-105' : ''
            }`}
        >
            <div className="flex items-start gap-3">
                {!isFirstBlock && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                )}
                {isFirstBlock && (
                    <div className="flex-shrink-0 mt-2 text-gray-300 dark:text-gray-600">
                        <GripVertical className="w-5 h-5" />
                    </div>
                )}

                <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {isFirstBlock ? '제목 (자동 생성)' : '섹션 제목'}
                            </label>
                            <input
                                type="text"
                                value={isFirstBlock ? TITLE_DISPLAY_TEXT : block.title}
                                onChange={(e) => onUpdate(block.id, { title: e.target.value })}
                                placeholder={isFirstBlock ? TITLE_DISPLAY_TEXT : '섹션 제목 (예: 핵심 로직)'}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                readOnly={isFirstBlock}
                            />
                            {isFirstBlock && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    제목은 자동으로 생성됩니다. 수정할 수 없습니다.
                                </p>
                            )}
                        </div>
                        <div className="w-full sm:w-32">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                글자 크기
                            </label>
                            <select
                                value={block.level}
                                onChange={(e) => onUpdate(block.id, { level: e.target.value as 'h1' | 'h2' | 'h3' | 'p' })}
                                disabled={isFirstBlock && (block.level === 'h3' || block.level === 'p')}
                                className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isFirstBlock ? (
                                    <>
                                        <option value="h1">H1 (대제목)</option>
                                        <option value="h2">H2 (중제목)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="h2">H2 (중제목)</option>
                                        <option value="h3">H3 (소제목)</option>
                                        <option value="p">본문</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {!isFirstBlock && !block.isDefaultSection && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                섹션 내용
                            </label>
                            <textarea
                                value={block.content ?? ''}
                                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                                placeholder="섹션 내용을 입력하세요. (여러 줄 가능)"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            />
                        </div>
                    )}

                    {!isFirstBlock && block.isDefaultSection && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            기본 섹션 내용은 회고 작성 시 자동으로 유지됩니다.
                        </p>
                    )}
                </div>

                {!isFirstBlock && !block.isDefaultSection && (
                    <button
                        type="button"
                        onClick={() => onDelete(block.id)}
                        className="flex-shrink-0 mt-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="삭제"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
                {block.isDefaultSection && (
                    <div className="flex-shrink-0 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        기본 섹션
                    </div>
                )}
            </div>
        </div>
    );
});
SortableBlockCard.displayName = 'SortableBlockCard';

export const TemplateBlockBuilder: FC<TemplateBlockBuilderProps> = ({
    initialMarkdown = '',
    templateTitle,
    onTemplateTitleChange,
    onMarkdownChange,
    onClose,
    onSave,
    isSaving = false,
}) => {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [blocks, setBlocks] = useState<TemplateBlock[]>(() => {
        if (initialMarkdown) {
            const parsed = parseMarkdownToBlocks(initialMarkdown, TITLE_DISPLAY_TEXT);
            // 첫 번째 블록의 표시 텍스트를 "회고 제목"으로 변경
            if (parsed.length > 0 && parsed[0].level === 'h1') {
                parsed[0] = { ...parsed[0], title: TITLE_DISPLAY_TEXT };
            }
            // 기본 섹션이 없으면 추가 (제출한 코드, 문제 링크/티어)
            const hasCodeSection = /##\s*제출한\s*코드/i.test(initialMarkdown);
            const hasMetaSection = /\[문제 링크\]\(/i.test(initialMarkdown) || /Generated by DidimLog/i.test(initialMarkdown);
            
            if (!hasCodeSection) {
                parsed.push({ 
                    id: crypto.randomUUID(), 
                    title: '제출한 코드', 
                    level: 'h2',
                    content: '```kotlin\n여기에 코드를 작성하세요.\n```',
                    isDefaultSection: true 
                });
            }
            if (!hasMetaSection) {
                parsed.push({ 
                    id: crypto.randomUUID(), 
                    title: '문제 링크 및 메타 정보', 
                    level: 'p',
                    content: '---\n\n[문제 링크]({{link}}) | 티어: {{tier}}\n\nGenerated by DidimLog',
                    isDefaultSection: true 
                });
            }
            return parsed;
        }
        // 새 템플릿 생성 시 기본 블록 추가
        return [
            { id: crypto.randomUUID(), title: TITLE_DISPLAY_TEXT, level: 'h1' },
            {
                id: crypto.randomUUID(),
                title: '제출한 코드',
                level: 'h2',
                content: '```kotlin\n여기에 코드를 작성하세요.\n```',
                isDefaultSection: true,
            },
            {
                id: crypto.randomUUID(),
                title: '문제 링크 및 메타 정보',
                level: 'p',
                content: '---\n\n[문제 링크]({{link}}) | 티어: {{tier}}\n\nGenerated by DidimLog',
                isDefaultSection: true,
            },
        ];
    });

    const [isSuccessChecked, setIsSuccessChecked] = useState<boolean>(true);
    const [isFailChecked, setIsFailChecked] = useState<boolean>(false);
    const [defaultMode, setDefaultMode] = useState<'NONE' | TemplateCategory | 'BOTH'>('NONE');
    const [titleError, setTitleError] = useState<string>('');
    const [useAutoNumbering, setUseAutoNumbering] = useState<boolean>(false);
    const [useEmoji, setUseEmoji] = useState<boolean>(true);
    const [useGuideQuestion, setUseGuideQuestion] = useState<boolean>(true);

    const { data: presets, isLoading: isLoadingPresets, error: presetsError } = usePresets();

    const presetByNormalizedTitle = useMemo(() => {
        const map = new Map<string, NonNullable<typeof presets>[number]>();
        if (!presets) {
            return map;
        }
        presets.forEach((preset) => {
            if (!preset?.title) {
                return;
            }
            const key = normalizeSectionTitle(preset.title);
            if (!map.has(key)) {
                map.set(key, preset);
            }
        });
        return map;
    }, [presets]);

    // 프리셋 로드 오류 처리
    useEffect(() => {
        if (presetsError) {
            console.error('[TemplateBlockBuilder] 프리셋 로드 오류:', presetsError);
        }
    }, [presetsError]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 블록 변경 시 마크다운 변환 (가이드 질문 포함)
    const markdown = useMemo(() => {
        const markdownBlocks = blocks.map((block, index) => {
            // 첫 번째 블록(제목) 처리
            if (index === 0) {
                // 제목 블록의 level에 따라 헤더 마크다운 생성
                const titlePrefix = block.level === 'h1' ? '#' : '##';
                if (block.title === TITLE_DISPLAY_TEXT) {
                    return `${titlePrefix} ${DEFAULT_TITLE_FORMAT}`;
                }
                return `${titlePrefix} ${block.title}`;
            }

            // 기본 섹션 처리 (제출한 코드, 문제 링크 및 메타 정보)
            if (block.isDefaultSection) {
                if (block.title === '제출한 코드') {
                    return '## 제출한 코드\n\n```kotlin\n여기에 코드를 작성하세요.\n```';
                }
                if (block.title === '문제 링크 및 메타 정보') {
                    return '---\n\n[문제 링크]({{link}}) | 티어: {{tier}}\n\nGenerated by DidimLog';
                }
            }

            // 섹션 블록 처리
            let sectionTitle = block.title;

            // 이모지 제거 처리 (useEmoji가 false일 때)
            if (!useEmoji && sectionTitle) {
                sectionTitle = removeSectionEmoji(sectionTitle);
            }

            // 번호 매기기 (useAutoNumbering이 true일 때)
            if (useAutoNumbering && sectionTitle) {
                // 첫 번째 블록(제목)을 제외한 인덱스를 번호로 사용
                // index는 0부터 시작하므로, 섹션 번호는 index가 됨 (첫 번째 섹션은 index=1이므로 번호는 1)
                const sectionNumber = index; // index=1이면 1번, index=2이면 2번, ...
                // 기존 번호 제거 후 새 번호 추가
                sectionTitle = `${sectionNumber}. ${sectionTitle.replace(/^\d+\.\s*/, '')}`;
            }

            let section = '';

            // 섹션 제목 생성 (마크다운 형식 적용)
            if (block.level === 'h2') {
                section = `## ${sectionTitle || '섹션 제목'}`;
            } else if (block.level === 'h3') {
                section = `### ${sectionTitle || '섹션 제목'}`;
            } else if (block.level === 'p') {
                section = `**${sectionTitle || '섹션 제목'}**`;
            } else {
                section = `## ${sectionTitle || '섹션 제목'}`;
            }

            const contentBody = block.content?.trim();
            if (contentBody) {
                section += `\n\n${contentBody}`;
            }

            // 가이드 질문 포함 (useGuideQuestion이 true일 때만)
            if (useGuideQuestion && sectionTitle && presetByNormalizedTitle.size > 0) {
                const matchedPreset = presetByNormalizedTitle.get(normalizeSectionTitle(sectionTitle));

                // contentGuide가 있으면 우선 사용, 없으면 guide 사용 (백엔드 가이드 기준)
                const guideText = matchedPreset?.contentGuide || matchedPreset?.guide;
                if (guideText) {
                    // contentGuide가 여러 줄일 수 있으므로 각 줄을 처리
                    const guideLines = guideText.split('\n').filter(line => line.trim());
                    if (guideLines.length > 0) {
                        section += '\n\n';
                        guideLines.forEach((line, lineIndex) => {
                            const trimmedLine = line.trim();
                            if (lineIndex === 0) {
                                // 첫 번째 줄은 "💡 가이드:" 접두사 추가
                                section += `💡 **가이드:** ${trimmedLine}`;
                            } else {
                                // 나머지 줄은 그대로 추가
                                section += `\n\n${trimmedLine}`;
                            }
                        });
                    }
                }
            }

            return section;
        });

        return markdownBlocks.join('\n\n');
    }, [blocks, useGuideQuestion, useAutoNumbering, useEmoji, presetByNormalizedTitle]);

    // 마크다운 변경 시 부모에 알림 (무한 루프 방지를 위해 onMarkdownChange는 의존성에서 제외)
    useEffect(() => {
        onMarkdownChange(markdown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markdown]);

    // 로컬 미리보기: 섹션 순서와 가이드 질문만 표시
    const previewContent = useMemo(() => {
        // 프로필 페이지 미리보기에서는 성공/실패 여부와 관계없이 중립적인 제목 사용
        const previewBlocks = blocks.map((block, index) => {
            if (index === 0) {
                // 제목 블록은 미리보기용 간소화된 형식 사용
                // 제목 블록의 level(h1/h2)에 따라 헤더 마크다운 생성
                const titlePrefix = block.level === 'h1' ? '#' : '##';
                const titleText = PREVIEW_TITLE_FORMAT
                    .replace(/^#\s+/, '') // 기존 # 제거
                    .replace(/\{\{problemTitle\}\}/g, '문제 제목')
                    .replace(/\{\{problemId\}\}/g, '문제 번호')
                    .replace(/\{\{language\}\}/g, '언어')
                    .replace(/\{\{result\}\}/g, '결과');
                return `${titlePrefix} ${titleText}`;
            }

            // 기본 섹션 처리 (제출한 코드, 문제 링크 및 메타 정보)
            if (block.isDefaultSection) {
                if (block.title === '제출한 코드') {
                    return '## 제출한 코드\n\n```kotlin\n여기에 코드를 작성하세요.\n```';
                }
                if (block.title === '문제 링크 및 메타 정보') {
                    return '---\n\n[문제 링크]({{link}}) | 티어: {{tier}}\n\nGenerated by DidimLog';
                }
            }

            let sectionTitle = block.title;
            let section = '';

            // 이모지 제거 처리
            if (!useEmoji && sectionTitle) {
                sectionTitle = removeSectionEmoji(sectionTitle);
            }

            // 번호 매기기
            if (useAutoNumbering && sectionTitle) {
                const currentNumber = index; // 첫 번째 블록(제목) 제외한 인덱스
                sectionTitle = `${currentNumber}. ${sectionTitle.replace(/^\d+\.\s*/, '')}`;
            }

            // 섹션 제목 생성
            if (block.level === 'h2') {
                section = `## ${sectionTitle || '섹션 제목'}`;
            } else if (block.level === 'h3') {
                section = `### ${sectionTitle || '섹션 제목'}`;
            } else if (block.level === 'p') {
                section = `**${sectionTitle || '섹션 제목'}**`;
            } else {
                section = `## ${sectionTitle || '섹션 제목'}`;
            }

            const contentBody = block.content?.trim();
            if (contentBody) {
                section += `\n\n${contentBody}`;
            }

            // 가이드 질문 포함
            if (useGuideQuestion && sectionTitle && presetByNormalizedTitle.size > 0) {
                const matchedPreset = presetByNormalizedTitle.get(normalizeSectionTitle(sectionTitle));

                // guide 필드 사용 (API 명세서와 일치)
                const guideText = matchedPreset?.guide;
                if (guideText) {
                    section += `\n\n> 💡 **가이드:** ${guideText}`;
                }
            }

            return section;
        });

        // 플레이스홀더를 사용자 친화적인 텍스트로 변환
        const previewWithFriendlyText = previewBlocks.join('\n\n')
            .replace(/\{\{problemId\}\}/g, '문제 번호')
            .replace(/\{\{problemTitle\}\}/g, '문제 제목')
            .replace(/\{\{language\}\}/g, '언어')
            .replace(/\{\{result\}\}/g, '결과')
            // 티어는 "문제 티어"로 표시
            .replace(/\{\{tier\}\}/g, '문제 티어');

        return previewWithFriendlyText;
    }, [blocks, useAutoNumbering, useEmoji, useGuideQuestion, presetByNormalizedTitle]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const firstBlockId = blocks[0]?.id;
        if (active.id === firstBlockId || over.id === firstBlockId) {
            return;
        }

        setBlocks((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            if (oldIndex === 0 || newIndex === 0) {
                return items;
            }
            return arrayMove(items, oldIndex, newIndex);
        });
    }, [blocks]);

    const handleUpdateBlock = useCallback((id: string, updates: Partial<TemplateBlock>) => {
        if ('title' in updates) {
            measureInputLatency('template-builder:block-title');
        }
        const isFirstBlock = blocks[0]?.id === id;
        if (isFirstBlock && 'title' in updates) {
            return;
        }
        setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...updates } : block)));
    }, [blocks]);

    const handleDeleteBlock = useCallback((id: string) => {
        const isFirstBlock = blocks[0]?.id === id;
        if (isFirstBlock) {
            toast.error('제목 블록은 삭제할 수 없습니다.');
            return;
        }

        const blockToDelete = blocks.find((block) => block.id === id);
        if (blockToDelete?.isDefaultSection) {
            toast.error('기본 섹션은 삭제할 수 없습니다.');
            return;
        }

        if (blocks.length === 1) {
            toast.error('최소 하나의 블록은 필요합니다.');
            return;
        }

        setBlocks((prev) => prev.filter((block) => block.id !== id));
    }, [blocks]);

    /**
     * 현재 본문에서 최대 섹션 번호를 찾아 다음 번호를 반환
     */
    const getNextSectionNumber = (currentContent: string): number => {
        const pattern = /^##\s*(\d+)\./gm;
        const matches = currentContent.matchAll(pattern);
        let maxNumber = 0;

        for (const match of matches) {
            const number = parseInt(match[1], 10);
            if (!isNaN(number) && number > maxNumber) {
                maxNumber = number;
            }
        }

        return maxNumber + 1;
    };

    /**
     * 프리셋 클릭 시 스마트 섹션 삽입
     */
    const handleAddPreset = (presetTitle: string) => {
        if (!presetTitle) {
            return;
        }
        
        let sectionTitle = presetTitle;
        
        // 이모지 제거 (useEmoji가 false일 때)
        if (!useEmoji) {
            sectionTitle = removeSectionEmoji(sectionTitle);
        }

        // 번호 매기기
        if (useAutoNumbering) {
            const currentMarkdown = convertBlocksToMarkdown(blocks);
            const nextNumber = getNextSectionNumber(currentMarkdown);
            sectionTitle = `${nextNumber}. ${sectionTitle}`;
        }

        // 새 블록 생성
        const matchedPreset = filteredPresets.find((preset) => preset.title === presetTitle);
        const presetContent = matchedPreset?.contentGuide || matchedPreset?.guide || '';
        const newBlock: TemplateBlock = {
            id: crypto.randomUUID(),
            title: sectionTitle,
            level: 'h2',
            content: presetContent,
        };

        // 가이드 질문은 미리보기에서만 표시되므로 여기서는 블록만 추가
        setBlocks((prev) => [...prev, newBlock]);
        scrollToBottom();
    };

    // 직접 입력 블록 추가
    const handleAddCustomBlock = () => {
        const newBlock: TemplateBlock = {
            id: crypto.randomUUID(),
            title: '',
            level: 'h2',
            content: '',
        };
        setBlocks((prev) => [...prev, newBlock]);
        scrollToBottom();
    };

    // 사용된 프리셋 제목 목록 (제목 블록 제외)
    const usedPresetTitles = useMemo(() => {
        return new Set(
            blocks
                .slice(1)
                .map((block) => {
                    // 이모지와 번호 제거하여 원본 제목 추출
                    if (!block.title) {
                        return '';
                    }
                    return normalizeSectionTitle(block.title);
                })
                .filter(Boolean)
        );
    }, [blocks]);

    // 체크박스 상태에 따라 필터링된 프리셋 목록
    const filteredPresets = useMemo(() => {
        if (!presets || presets.length === 0) {
            return [];
        }

        const filtered = presets.filter((p) => {
            if (!p || !p.title) {
                return false;
            }

            // category를 대문자로 정규화 (대소문자 이슈 방지)
            const normalizedCategory = p.category?.toUpperCase() || '';

            let shouldInclude = false;

            // 필터링 규칙
            // 1. 둘 다 체크됨: 모든 프리셋 표시
            if (isSuccessChecked && isFailChecked) {
                shouldInclude = true;
            }
            // 2. 성공만 체크됨: SUCCESS 또는 COMMON
            else if (isSuccessChecked) {
                shouldInclude = normalizedCategory === 'SUCCESS' || normalizedCategory === 'COMMON';
            }
            // 3. 실패만 체크됨: FAIL 또는 COMMON
            else if (isFailChecked) {
                shouldInclude = normalizedCategory === 'FAIL' || normalizedCategory === 'COMMON';
            }
            // 4. 둘 다 체크 안 됨: 빈 배열
            else {
                shouldInclude = false;
            }

            return shouldInclude;
        });

        return filtered;
    }, [presets, isSuccessChecked, isFailChecked]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            const blocksContainer = document.querySelector('.template-blocks-container');
            if (blocksContainer) {
                blocksContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, SCROLL_DELAY_MS);
    }, []);

    const blockIds = useMemo(() => blocks.map((block) => block.id), [blocks]);
    const focusTitleInput = useCallback(() => {
        if (!titleInputRef.current) {
            return;
        }
        titleInputRef.current.focus();
        titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full mx-2 sm:mx-4 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1 space-y-3">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">템플릿 편집</h2>
                        <div className="space-y-1">
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={templateTitle}
                                onChange={(e) => {
                                    measureInputLatency('template-builder:title');
                                    setTitleError('');
                                    onTemplateTitleChange(e.target.value);
                                }}
                                onBlur={(e) => {
                                    const trimmed = e.target.value.trim();
                                    if (trimmed.length === 0) {
                                        setTitleError('템플릿 이름을 입력해주세요.');
                                        return;
                                    }
                                    const isOnlyJamo = /^[ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmed);
                                    if (isOnlyJamo) {
                                        setTitleError('자음 또는 모음만 입력할 수 없습니다.');
                                        return;
                                    }
                                    setTitleError('');
                                }}
                                placeholder="템플릿 이름을 입력하세요 (최소 1자 이상)"
                                maxLength={100}
                                className={`w-full max-w-md px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                                    titleError
                                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                }`}
                            />
                            {titleError && (
                                <p className="text-xs text-red-600 dark:text-red-400">{titleError}</p>
                            )}
                        </div>

                        {/* 프리셋 필터 */}
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">프리셋 필터:</span>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSuccessChecked}
                                        onChange={(e) => {
                                            setIsSuccessChecked(e.target.checked);
                                        }}
                                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">🟢 성공 회고</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isFailChecked}
                                        onChange={(e) => {
                                            setIsFailChecked(e.target.checked);
                                        }}
                                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">🔴 실패 회고</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 본문: 2분할 레이아웃 (모바일: 세로 배치, 데스크톱: 가로 배치) */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* 왼쪽: 블록 빌더 */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            {/* 스마트 섹션 삽입 토글 */}
                            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    스마트 섹션 삽입 옵션
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useAutoNumbering}
                                            onChange={(e) => setUseAutoNumbering(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">🔢 번호 자동 매기기</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useEmoji}
                                            onChange={(e) => setUseEmoji(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">😊 이모지 사용</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useGuideQuestion}
                                            onChange={(e) => setUseGuideQuestion(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">❓ 가이드 질문 포함</span>
                                    </label>
                                </div>
                            </div>

                            {/* 프리셋 섹션 */}
                            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    섹션 프리셋
                                </h3>
                                {isLoadingPresets ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Spinner />
                                        <span className="ml-2 text-sm text-gray-500">프리셋을 불러오는 중...</span>
                                    </div>
                                ) : presetsError ? (
                                    <div className="flex items-center justify-center py-4">
                                        <span className="text-sm text-red-500">프리셋을 불러오는 중 오류가 발생했습니다.</span>
                                    </div>
                                ) : !presets || presets.length === 0 ? (
                                    <div className="flex items-center justify-center py-4">
                                        <span className="text-sm text-gray-500">프리셋이 없습니다.</span>
                                    </div>
                                ) : filteredPresets.length === 0 ? (
                                    <div className="flex items-center justify-center py-4">
                                        <span className="text-sm text-gray-500">
                                            {!isSuccessChecked && !isFailChecked
                                                ? '용도를 선택해주세요.'
                                                : `선택한 용도(${isSuccessChecked && isFailChecked ? '성공 회고 + 실패 회고' : isSuccessChecked ? '성공 회고' : '실패 회고'})에 해당하는 프리셋이 없습니다.`}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {filteredPresets.map((preset) => {
                                            if (!preset || !preset.title) {
                                                return null;
                                            }
                                            const presetTitleWithoutEmoji = normalizeSectionTitle(preset.title);
                                            const isUsed = usedPresetTitles.has(presetTitleWithoutEmoji);
                                            return (
                                                <button
                                                    key={preset.title}
                                                    type="button"
                                                    onClick={() => handleAddPreset(preset.title)}
                                                    disabled={isUsed}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                                        isUsed
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed line-through'
                                                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                                    }`}
                                                    title={isUsed ? '이미 사용된 섹션입니다' : preset.guide || ''}
                                                >
                                                    {preset.title}
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={handleAddCustomBlock}
                                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm transition-colors border border-dashed border-gray-300 dark:border-gray-600"
                                            title="빈 섹션을 직접 입력합니다"
                                        >
                                            [+ 직접 입력]
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 블록 리스트 */}
                            <div className="pt-4 template-blocks-container">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    템플릿 섹션
                                </h3>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext
                                        items={blockIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-4">
                                            {blocks.map((block, index) => (
                                                <SortableBlockCard
                                                    key={block.id}
                                                    block={block}
                                                    index={index}
                                                    onUpdate={handleUpdateBlock}
                                                    onDelete={handleDeleteBlock}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 로컬 미리보기 */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
                        <div className="mb-4">
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    템플릿 미리보기
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    섹션 순서와 가이드 질문이 표시됩니다. 실제 문제 데이터는 템플릿 저장 후 회고 작성 시 반영됩니다.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">
                            <div className="prose dark:prose-invert max-w-none">
                                <MarkdownViewer content={previewContent || '템플릿 내용을 작성하면 미리보기가 표시됩니다.'} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            저장 후 기본 템플릿 적용
                        </label>
                        <select
                            value={defaultMode}
                            onChange={(e) =>
                                setDefaultMode(e.target.value as 'NONE' | TemplateCategory | 'BOTH')
                            }
                            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NONE">적용 안 함 (저장만)</option>
                            <option value="SUCCESS">성공 회고 기본으로 적용</option>
                            <option value="FAIL">실패 회고 기본으로 적용</option>
                            <option value="BOTH">성공/실패 모두 기본으로 적용</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                            취소
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                const trimmed = templateTitle.trim();
                                
                                // 제목이 비어있는 경우
                                if (trimmed.length === 0) {
                                    setTitleError('템플릿 이름을 입력해주세요.');
                                    toast.error('템플릿 이름을 입력해주세요.');
                                    focusTitleInput();
                                    return;
                                }
                                
                                // 자음/모음만 입력한 경우
                                const isOnlyJamo = /^[ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmed);
                                if (isOnlyJamo) {
                                    setTitleError('자음 또는 모음만 입력할 수 없습니다.');
                                    toast.error('자음 또는 모음만 입력할 수 없습니다.');
                                    focusTitleInput();
                                    return;
                                }
                                
                                // 기타 제목 에러가 있는 경우
                                if (titleError) {
                                    toast.error(titleError);
                                    focusTitleInput();
                                    return;
                                }

                                // 블록이 없는 경우
                                if (blocks.length === 0) {
                                    toast.error('템플릿에 최소 하나의 섹션이 필요합니다.');
                                    return;
                                }

                                onSave(markdown, { defaultMode });
                            }}
                            isLoading={isSaving}
                        >
                            저장
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
