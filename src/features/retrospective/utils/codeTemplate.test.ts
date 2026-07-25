import { describe, expect, it } from 'vitest';
import { insertCodeIntoTemplate } from './codeTemplate';

describe('insertCodeIntoTemplate', () => {
    it('선택한 언어로 기본 코드 fence를 교체한다', () => {
        const template = '## 제출한 코드\n\n```kotlin\n여기에 코드를 작성하세요.\n```';

        const result = insertCodeIntoTemplate(template, 'print("hello")', 'python');

        expect(result).toContain('```python\nprint("hello")\n```');
        expect(result).not.toContain('```kotlin');
    });

    it('언어가 text이면 템플릿의 기존 언어를 유지한다', () => {
        const template = '## 제출한 코드\n\n```java\nWrite your code here\n```';

        const result = insertCodeIntoTemplate(template, 'class Main {}', 'text');

        expect(result).toContain('```java\nclass Main {}\n```');
    });

    it('이미 작성된 코드 블록은 덮어쓰지 않는다', () => {
        const template = '## 제출한 코드\n\n```python\nprint("existing")\n```';

        expect(insertCodeIntoTemplate(template, 'print("new")', 'python')).toBe(template);
    });

    it('replacement token과 같은 코드도 원문 그대로 보존한다', () => {
        const template = '## 제출한 코드\n\n```text\n여기에 코드를 작성하세요.\n```';

        const result = insertCodeIntoTemplate(template, 'const value = "$&-$1";', 'javascript');

        expect(result).toContain('```javascript\nconst value = "$&-$1";\n```');
    });
});
