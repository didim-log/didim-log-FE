/**
 * 마크다운 뷰어 컴포넌트
 * GitHub Flavored Markdown 스타일의 줄바꿈을 지원합니다.
 */

import type { ComponentPropsWithoutRef, CSSProperties, FC, ReactNode } from 'react';
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
    type WithNode<T> = T & { node?: unknown };
    const withoutNode = <T extends { node?: unknown }>(props: T): Omit<T, 'node'> => {
        const { node, ...rest } = props;
        void node;
        return rest;
    };

    type HeadingProps = WithNode<ComponentPropsWithoutRef<'h1'>>;
    type ParagraphProps = WithNode<ComponentPropsWithoutRef<'p'>>;
    type ListProps = WithNode<ComponentPropsWithoutRef<'ul'>>;
    type OrderedListProps = WithNode<ComponentPropsWithoutRef<'ol'>>;
    type ListItemProps = WithNode<ComponentPropsWithoutRef<'li'>>;
    type BlockquoteProps = WithNode<ComponentPropsWithoutRef<'blockquote'>>;
    type BreakProps = WithNode<ComponentPropsWithoutRef<'br'>>;

    type CodeProps = WithNode<
        Omit<ComponentPropsWithoutRef<'code'>, 'children'> & {
            inline?: boolean;
            className?: string;
            children?: ReactNode;
        }
    >;

    const components = {
        h1: (props: HeadingProps) => (
            <h1
                className="text-3xl font-bold mt-8 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white"
                {...withoutNode(props)}
            />
        ),
        h2: (props: HeadingProps) => (
            <h2
                className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white"
                {...withoutNode(props)}
            />
        ),
        h3: (props: HeadingProps) => (
            <h3
                className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white"
                {...withoutNode(props)}
            />
        ),
        p: (props: ParagraphProps) => (
            <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200" {...withoutNode(props)} />
        ),
        ul: (props: ListProps) => (
            <ul
                className="list-disc ml-6 mb-4 space-y-1 text-gray-800 dark:text-gray-200"
                {...withoutNode(props)}
            />
        ),
        ol: (props: OrderedListProps) => (
            <ol
                className="list-decimal ml-6 mb-4 space-y-1 text-gray-800 dark:text-gray-200"
                {...withoutNode(props)}
            />
        ),
        li: (props: ListItemProps) => (
            <li className="leading-relaxed" {...withoutNode(props)} />
        ),
        blockquote: (props: BlockquoteProps) => (
            <blockquote
                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 italic"
                {...withoutNode(props)}
            />
        ),
        br: (props: BreakProps) => <br {...withoutNode(props)} />,
        code: (props: CodeProps) => {
            const { inline, className, children, ...rest } = withoutNode(props);
            const { style, ...safeRest } = rest;
            void style;

            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // text 언어를 실제 언어로 매핑 시도 (마크다운에서 언어 정보 추출)
            const mapLanguage = (lang: string): string => {
                if (lang !== 'text' && lang) {
                    return lang;
                }
                // 마크다운 내용에서 언어 힌트를 찾기 시도
                const content = String(children).trim();
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
            };

            const mappedLanguage = mapLanguage(language);

            if (!inline && match) {
                return (
                    <div className="my-4">
                        <SyntaxHighlighter
                            // 라이브러리 타입 정의가 엄격해서 명시적으로 캐스팅합니다.
                            style={vscDarkPlus as unknown as Record<string, CSSProperties>}
                            language={mappedLanguage}
                            PreTag="div"
                            className="rounded-lg"
                            wrapLines={true}
                            customStyle={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                            {...safeRest}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    </div>
                );
            }

            return (
                <code
                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm"
                    {...safeRest}
                >
                    {children}
                </code>
            );
        },
    };

    return (
        <div className={`prose dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

