/**
 * 마크다운 뷰어 컴포넌트
 * GitHub Flavored Markdown 스타일의 줄바꿈을 지원합니다.
 */

import { memo, useMemo } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, FC, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c++', cpp);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('kt', kotlin);
SyntaxHighlighter.registerLanguage('go', go);

export const MarkdownViewer: FC<MarkdownViewerProps> = memo(({ content, className = '' }) => {
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

    const components = useMemo(() => ({
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

            const mapLanguage = (lang: string): string => {
                if (lang !== 'text' && lang) {
                    return lang;
                }
                const codeContent = String(children).trim();
                if (codeContent.includes('public class') || codeContent.includes('import java')) {
                    return 'java';
                }
                if (codeContent.includes('def ') || (codeContent.includes('import ') && !codeContent.includes('import java'))) {
                    return 'python';
                }
                if (codeContent.includes('function ') || codeContent.includes('const ') || codeContent.includes('let ')) {
                    return 'javascript';
                }
                if (codeContent.includes('#include') || codeContent.includes('using namespace')) {
                    return 'cpp';
                }
                if (codeContent.includes('fun ') || codeContent.includes('import kotlin')) {
                    return 'kotlin';
                }
                if (codeContent.includes('package ') && codeContent.includes('import ')) {
                    return 'go';
                }
                return 'text';
            };

            const mappedLanguage = mapLanguage(language);

            if (!inline && match) {
                return (
                    <div className="my-4">
                        <SyntaxHighlighter
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
    }), []);

    const remarkPlugins = useMemo(() => [remarkGfm, remarkBreaks], []);

    return (
        <div className={`prose dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={remarkPlugins}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});
MarkdownViewer.displayName = 'MarkdownViewer';
