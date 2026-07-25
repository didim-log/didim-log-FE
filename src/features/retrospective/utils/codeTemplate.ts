const isEmptyCodeBlock = (content: string): boolean => {
    const trimmed = content.trim();
    return (
        !trimmed ||
        trimmed.includes('여기에 코드를 작성하세요') ||
        trimmed.includes('Write your code here')
    );
};

const resolveCodeLanguage = (selectedLanguage: string, existingLanguage?: string): string => {
    const normalizedSelected = selectedLanguage.trim().toLowerCase();
    if (normalizedSelected && normalizedSelected !== 'text') {
        return normalizedSelected;
    }
    return existingLanguage && existingLanguage !== 'text' ? existingLanguage : 'text';
};

/**
 * 제출한 코드 섹션의 빈 코드 블록에 코드를 삽입한다.
 * 사용자가 선택한 언어가 있으면 템플릿의 기본 fence 언어보다 우선한다.
 */
export const insertCodeIntoTemplate = (
    templateContent: string,
    code: string,
    programmingLanguage: string
): string => {
    if (!code.trim()) {
        return templateContent;
    }

    const submittedCodePattern = /##\s*제출한\s*코드[\s\S]*?```(\w+)?\n([\s\S]*?)```/i;
    const submittedCodeMatch = templateContent.match(submittedCodePattern);

    if (submittedCodeMatch && isEmptyCodeBlock(submittedCodeMatch[2])) {
        const codeLanguage = resolveCodeLanguage(programmingLanguage, submittedCodeMatch[1]);
        return templateContent.replace(
            /(##\s*제출한\s*코드[\s\S]*?)```(\w+)?\n([\s\S]*?)```/i,
            (_match, sectionPrefix: string) =>
                `${sectionPrefix}\`\`\`${codeLanguage}\n${code.trim()}\n\`\`\``
        );
    }

    let isReplaced = false;
    return templateContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, content) => {
        if (isReplaced || !isEmptyCodeBlock(content)) {
            return match;
        }
        isReplaced = true;
        const codeLanguage = resolveCodeLanguage(programmingLanguage, language);
        return `\`\`\`${codeLanguage}\n${code.trim()}\n\`\`\``;
    });
};
