/**
 * 공지사항 관리 컴포넌트 (ADMIN)
 */

import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { useCreateNotice, useDeleteNotice, useNotices, useUpdateNotice } from '../../../hooks/api/useNotice';
import type { NoticeResponse } from '../../../types/api/notice.types';
import { formatKST } from '../../../utils/dateUtils';
import { toast } from 'sonner';
import { toastApiError } from '../../../utils/toastApiError';

export const NoticeManagement: FC = () => {
    const [page, setPage] = useState(1);
    // 관리자 페이지에서는 모든 공지를 가져오기 위해 size를 100으로 설정
    const { data, isLoading, error, refetch } = useNotices({ page, size: 100 });
    const createMutation = useCreateNotice();
    const updateMutation = useUpdateNotice();
    const deleteMutation = useDeleteNotice();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [createErrors, setCreateErrors] = useState<{ title?: string; content?: string }>({});

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editPinned, setEditPinned] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const sortedContent = useMemo(() => {
        const notices = data?.content ?? [];
        if (notices.length === 0) {
            return [];
        }
        // 서버가 이미 pinned 우선 정렬을 보장한다고 가정하되,
        // 프론트에서도 pinned를 상단으로 한번 더 안정화합니다.
        return [...notices].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
    }, [data?.content]);

    const beginEdit = (notice: NoticeResponse) => {
        setEditingId(notice.id);
        setEditTitle(notice.title);
        setEditContent(notice.content);
        setEditPinned(notice.isPinned);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
        setEditPinned(false);
    };

    const confirmDelete = (notice: NoticeResponse): boolean => {
        const input = prompt(`삭제하려면 "${notice.id}"를 입력해주세요.`);
        return input === notice.id;
    };

    const handleCopyId = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            setCopiedId(id);
            toast.success('ID가 클립보드에 복사되었습니다.');
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error('ID 복사에 실패했습니다.');
        }
    };

    const shortenId = (id: string): string => {
        if (id.length <= 12) {
            return id;
        }
        return `${id.slice(0, 8)}...${id.slice(-4)}`;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setCreateErrors({ title: '제목을 입력해주세요.' });
            return;
        }
        if (!content.trim()) {
            setCreateErrors({ content: '내용을 입력해주세요.' });
            return;
        }
        try {
            await createMutation.mutateAsync({
                title: title.trim(),
                content: content.trim(),
                isPinned: Boolean(isPinned), // 명시적으로 boolean으로 변환
            });
            // 성공 시 폼 초기화 및 리스트 새로고침
            setTitle('');
            setContent('');
            setIsPinned(false);
            setCreateErrors({});
            // 명시적으로 refetch 호출하여 즉시 업데이트
            await refetch();
            toast.success('공지가 작성되었습니다.');
        } catch (error: unknown) {
            toastApiError(error, '공지 작성에 실패했습니다.');
        }
    };

    const handleUpdate = async (noticeId: string) => {
        await updateMutation.mutateAsync({
            noticeId,
            data: {
                title: editTitle.trim(),
                content: editContent.trim(),
                isPinned: editPinned,
            },
        });
        cancelEdit();
    };

    const handleDelete = async (notice: NoticeResponse) => {
        if (!confirmDelete(notice)) {
            return;
        }
        try {
            await deleteMutation.mutateAsync(notice.id);
            // 삭제 성공 시 리스트 새로고침
            await refetch();
        } catch {
            // Error is handled by React Query mutation
        }
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error || !data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '공지사항 목록을 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 공지 작성 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">공지 작성</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="제목"
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setCreateErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                        placeholder="제목 (최대 200자)"
                        required
                        error={createErrors.title}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            내용
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setCreateErrors((prev) => ({ ...prev, content: undefined }));
                            }}
                            className="w-full min-h-[160px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="내용 (10자 이상, 최대 10000자)"
                            required
                        />
                        {createErrors.content && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {createErrors.content}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isPinned}
                            onChange={(e) => setIsPinned(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            id="notice-pinned"
                        />
                        <label htmlFor="notice-pinned" className="text-sm text-gray-700 dark:text-gray-300">
                            상단 고정
                        </label>
                    </div>

                    <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                        작성
                    </Button>
                </form>
            </div>

            {/* 공지 목록 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedContent.length === 0 && (
                        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                            공지사항이 없습니다.
                        </div>
                    )}

                    {sortedContent.map((notice) => {
                        const isEditing = editingId === notice.id;
                        return (
                            <div key={notice.id} className="p-6">
                                {!isEditing && (
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {notice.isPinned && (
                                                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold">
                                                        고정
                                                    </span>
                                                )}
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white break-words">
                                                    {notice.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    ID: {shortenId(notice.id)}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyId(notice.id)}
                                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title="ID 복사"
                                                    aria-label="ID 복사"
                                                >
                                                    {copiedId === notice.id ? (
                                                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                                {notice.content}
                                            </p>
                                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                {formatKST(notice.createdAt, 'full')}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => beginEdit(notice)}>
                                                수정
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(notice)}
                                                isLoading={deleteMutation.isPending}
                                                className="flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="space-y-4">
                                        <Input
                                            label="제목"
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="제목"
                                            required
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                내용
                                            </label>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full min-h-[160px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="내용"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editPinned}
                                                onChange={(e) => setEditPinned(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                id={`notice-edit-pinned-${notice.id}`}
                                            />
                                            <label
                                                htmlFor={`notice-edit-pinned-${notice.id}`}
                                                className="text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                상단 고정
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleUpdate(notice.id)}
                                                isLoading={updateMutation.isPending}
                                            >
                                                저장
                                            </Button>
                                            <Button variant="outline" onClick={cancelEdit}>
                                                취소
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {data.totalPages > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {data.currentPage} / {data.totalPages} 페이지
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setPage(data.currentPage - 1)}
                                disabled={!data.hasPrevious}
                                variant="outline"
                                size="sm"
                            >
                                이전
                            </Button>
                            <Button
                                onClick={() => setPage(data.currentPage + 1)}
                                disabled={!data.hasNext}
                                variant="outline"
                                size="sm"
                            >
                                다음
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
