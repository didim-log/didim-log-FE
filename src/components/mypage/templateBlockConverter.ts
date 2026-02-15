export interface TemplateBlock {
    id: string;
    title: string;
    level: 'h1' | 'h2' | 'h3' | 'p';
    content?: string;
    isDefaultSection?: boolean;
}

export const parseMarkdownToBlocks = (
    markdown: string,
    titleDisplayText: string
): TemplateBlock[] => {
    if (!markdown.trim()) {
        return [{ id: crypto.randomUUID(), title: titleDisplayText, level: 'h1' }];
    }

    const blocks: TemplateBlock[] = [];
    const lines = markdown.split('\n');
    let currentBlock: TemplateBlock | null = null;
    let currentContent: string[] = [];

    const pushCurrentBlock = () => {
        if (!currentBlock) {
            return;
        }

        const content = currentContent.join('\n').trim();
        blocks.push({
            ...currentBlock,
            content,
        });
        currentContent = [];
    };

    for (const line of lines) {
        const h1Match = line.match(/^#\s+(.+)$/);
        const h2Match = line.match(/^##\s+(.+)$/);
        const h3Match = line.match(/^###\s+(.+)$/);
        const boldMatch = line.match(/^\*\*(.+)\*\*$/);

        if (h1Match) {
            pushCurrentBlock();
            currentBlock = {
                id: crypto.randomUUID(),
                title: h1Match[1].trim(),
                level: 'h1',
            };
        } else if (h2Match) {
            pushCurrentBlock();
            const title = h2Match[1].trim();
            const isDefaultSection = title === '제출한 코드';
            currentBlock = {
                id: crypto.randomUUID(),
                title,
                level: 'h2',
                isDefaultSection,
            };
        } else if (h3Match) {
            pushCurrentBlock();
            currentBlock = {
                id: crypto.randomUUID(),
                title: h3Match[1].trim(),
                level: 'h3',
            };
        } else if (boldMatch) {
            pushCurrentBlock();
            currentBlock = {
                id: crypto.randomUUID(),
                title: boldMatch[1].trim(),
                level: 'p',
            };
        } else if (currentBlock) {
            currentContent.push(line);
        }
    }

    pushCurrentBlock();

    if (blocks.length === 0) {
        return [{ id: crypto.randomUUID(), title: titleDisplayText, level: 'h1' }];
    }

    if (
        blocks[0].level !== 'h1' ||
        (!blocks[0].title.includes('{{problemId}}') && blocks[0].title !== titleDisplayText)
    ) {
        blocks.unshift({ id: crypto.randomUUID(), title: titleDisplayText, level: 'h1' });
    }

    return blocks;
};

export const convertBlocksToMarkdown = (blocks: TemplateBlock[]): string => {
    return blocks
        .map((block) => {
            const body = block.content?.trim();

            let header = '';
            if (block.level === 'h1') header = `# ${block.title}`;
            else if (block.level === 'h2') header = `## ${block.title}`;
            else if (block.level === 'h3') header = `### ${block.title}`;
            else if (block.level === 'p') header = `**${block.title}**`;
            else header = `## ${block.title}`;

            if (!body) {
                return header;
            }

            return `${header}\n\n${body}`;
        })
        .join('\n\n');
};
