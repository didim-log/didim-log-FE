/**
 * 명언 관리 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useAdminQuotes, useCreateQuote, useDeleteQuote } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { toast } from 'sonner';

export const QuoteManagement: FC = () => {
    const [page, setPage] = useState(1);
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [errors, setErrors] = useState<{ content?: string; author?: string }>({});

    const { data, isLoading, error } = useAdminQuotes({ page, size: 20 });
    const createMutation = useCreateQuote();
    const deleteMutation = useDeleteQuote();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setErrors({ content: '명언 내용을 입력해주세요.' });
            return;
        }
        if (!author.trim()) {
            setErrors({ author: '저자명을 입력해주세요.' });
            return;
        }

        try {
            await createMutation.mutateAsync({ content: content.trim(), author: author.trim() });
            setContent('');
            setAuthor('');
            setErrors({});
            toast.success('명언이 추가되었습니다.');
        } catch {
            // Error is handled by React Query mutation
        }
    };

    const handleDelete = async (quoteId: string) => {
        if (confirm('정말 이 명언을 삭제하시겠습니까?')) {
            try {
                await deleteMutation.mutateAsync(quoteId);
            } catch {
                // Error is handled by React Query mutation
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error || !data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                    {error instanceof Error ? error.message : '명언 목록을 불러올 수 없습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 명언 추가 폼 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">명언 추가</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="명언 내용"
                        type="text"
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setErrors((prev) => ({ ...prev, content: undefined }));
                        }}
                        placeholder="명언 내용을 입력하세요"
                        required
                        error={errors.content}
                    />
                    <Input
                        label="저자명"
                        type="text"
                        value={author}
                        onChange={(e) => {
                            setAuthor(e.target.value);
                            setErrors((prev) => ({ ...prev, author: undefined }));
                        }}
                        placeholder="저자명을 입력하세요"
                        required
                        error={errors.author}
                    />
                    <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                        추가
                    </Button>
                </form>
            </div>

            {/* 명언 목록 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-6 space-y-4">
                    {data.content.map((quote) => (
                        <div
                            key={quote.id}
                            className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            <p className="text-gray-900 dark:text-white mb-2">"{quote.content}"</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">- {quote.author}</p>
                                <Button
                                    onClick={() => handleDelete(quote.id)}
                                    variant="danger"
                                    size="sm"
                                    isLoading={deleteMutation.isPending}
                                >
                                    삭제
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 페이지네이션 */}
                {data.totalPages > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {data.currentPage} / {data.totalPages} 페이지
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handlePageChange(data.currentPage - 1)}
                                disabled={!data.hasPrevious}
                                variant="outline"
                                size="sm"
                            >
                                이전
                            </Button>
                            <Button
                                onClick={() => handlePageChange(data.currentPage + 1)}
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

