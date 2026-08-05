/// <reference types="node" />

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const DEMO_DIRECTORY = dirname(fileURLToPath(import.meta.url));

const collectSourceFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
        return collectSourceFiles(path);
    }
    if (!/\.tsx?$/.test(entry.name) || entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
        return [];
    }
    return [path];
});

describe('데모 실행 경계', () => {
    it('데모 소스가 API, 인증 저장소, 브라우저 저장소를 직접 사용하지 않는다', () => {
        const forbiddenPatterns = [
            /api\/endpoints/,
            /hooks\/api/,
            /stores\/auth\.store/,
            /\baxios\b/,
            /\bfetch\s*\(/,
            /\blocalStorage\b/,
            /\bsessionStorage\b/,
            /document\.cookie/,
        ];

        collectSourceFiles(DEMO_DIRECTORY).forEach((path) => {
            const source = readFileSync(path, 'utf8');
            forbiddenPatterns.forEach((pattern) => {
                expect(source, `${path}에서 ${pattern.source} 사용`).not.toMatch(pattern);
            });
        });
    });
});
