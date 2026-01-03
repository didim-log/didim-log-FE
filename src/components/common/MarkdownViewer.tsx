/**
 * 마크다운 뷰어 컴포넌트
 * GitHub Flavored Markdown 스타일의 줄바꿈을 지원합니다.
 */

import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export const MarkdownViewer: FC<MarkdownViewerProps> = ({ content, className = '' }) => {
    return (
        <div className={`prose dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                    h1: ({ node, ...props }: any) => (
                        <h1 className="text-3xl font-bold mt-8 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white" {...props} />
                    ),
                    h2: ({ node, ...props }: any) => (
                        <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
                    ),
                    h3: ({ node, ...props }: any) => (
                        <h3 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />
                    ),
                    p: ({ node, children, ...props }: any) => (
                        <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200" {...props}>
                            {children}
                        </p>
                    ),
                    ul: ({ node, ...props }: any) => (
                        <ul className="list-disc ml-6 mb-4 space-y-1 text-gray-800 dark:text-gray-200" {...props} />
                    ),
                    ol: ({ node, ...props }: any) => (
                        <ol className="list-decimal ml-6 mb-4 space-y-1 text-gray-800 dark:text-gray-200" {...props} />
                    ),
                    li: ({ node, ...props }: any) => (
                        <li className="leading-relaxed" {...props} />
                    ),
                    blockquote: ({ node, ...props }: any) => (
                        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 italic" {...props} />
                    ),
                    br: ({ node, ...props }: any) => (
                        <br {...props} />
                    ),
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        // text 언어를 실제 언어로 매핑 시도 (마크다운에서 언어 정보 추출)
                        const mapLanguage = (lang: string): string => {
                            if (lang === 'text' || !lang) {
                                // 마크다운 내용에서 언어 힌트를 찾기 시도
                                const content = String(children).trim();
                                // Java, Python 등 일반적인 패턴 확인
                                if (content.includes('public class') || content.includes('import java')) {
                                    return 'java';
                                }
                                if (content.includes('def ') || (content.includes('import ') && !content.includes('import java'))) {
                                    return 'python';
                                }
                                if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
                                    return 'javascript';
                                }
                                if (content.includes('#include') || content.includes('using namespace')) {
                                    return 'cpp';
                                }
                                if (content.includes('fun ') || content.includes('import kotlin')) {
                                    return 'kotlin';
                                }
                                if (content.includes('package ') && content.includes('import ')) {
                                    return 'go';
                                }
                                return 'text';
                            }
                            return lang;
                        };

                        const mappedLanguage = mapLanguage(language);

                        return !inline && match ? (
                            <div className="my-4">
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={mappedLanguage}
                                    PreTag="div"
                                    className="rounded-lg"
                                    wrapLines={true}
                                    customStyle={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

