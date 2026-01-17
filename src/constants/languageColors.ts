/**
 * 프로그래밍 언어별 공식 브랜드 색상 정의
 * 각 언어의 공식 로고/브랜드 색상을 기반으로 Tailwind CSS 클래스를 매핑합니다.
 */

export type LanguageColorConfig = {
    bg: string; // 배경색 클래스
    text: string; // 텍스트 색상 클래스
    darkBg: string; // 다크모드 배경색 클래스
    darkText: string; // 다크모드 텍스트 색상 클래스
};

/**
 * 언어별 색상 매핑
 * 공식 브랜드 색상을 기반으로 설정
 */
export const LANGUAGE_COLORS: Record<string, LanguageColorConfig> = {
    // Java: Orange (#E76F00)
    java: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        darkBg: 'dark:bg-orange-900/30',
        darkText: 'dark:text-orange-300',
    },
    // Python: Blue (#3776AB)
    python: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        darkBg: 'dark:bg-blue-900/30',
        darkText: 'dark:text-blue-300',
    },
    // C++: Dark Blue (#00599C)
    cpp: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        darkBg: 'dark:bg-indigo-900/30',
        darkText: 'dark:text-indigo-300',
    },
    'c++': {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        darkBg: 'dark:bg-indigo-900/30',
        darkText: 'dark:text-indigo-300',
    },
    // JavaScript: Yellow (#F7DF1E)
    javascript: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        darkBg: 'dark:bg-yellow-900/30',
        darkText: 'dark:text-yellow-300',
    },
    // Kotlin: Purple (#7F52FF)
    kotlin: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        darkBg: 'dark:bg-purple-900/30',
        darkText: 'dark:text-purple-300',
    },
    // Swift: Red-Orange (#F05138)
    swift: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        darkBg: 'dark:bg-red-900/30',
        darkText: 'dark:text-red-300',
    },
    // Go: Cyan (#00ADD8)
    go: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-700',
        darkBg: 'dark:bg-cyan-900/30',
        darkText: 'dark:text-cyan-300',
    },
    // Rust: Orange-Red (#CE412B)
    rust: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        darkBg: 'dark:bg-amber-900/30',
        darkText: 'dark:text-amber-300',
    },
    // C: Slate
    c: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        darkBg: 'dark:bg-slate-800',
        darkText: 'dark:text-slate-300',
    },
    // C#: Violet
    csharp: {
        bg: 'bg-violet-100',
        text: 'text-violet-700',
        darkBg: 'dark:bg-violet-900/30',
        darkText: 'dark:text-violet-300',
    },
    'c#': {
        bg: 'bg-violet-100',
        text: 'text-violet-700',
        darkBg: 'dark:bg-violet-900/30',
        darkText: 'dark:text-violet-300',
    },
    // TypeScript: Blue
    typescript: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        darkBg: 'dark:bg-blue-900/30',
        darkText: 'dark:text-blue-300',
    },
    // Default: Gray
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        darkBg: 'dark:bg-gray-800',
        darkText: 'dark:text-gray-300',
    },
};

/**
 * 언어 이름을 표시용 라벨로 변환
 */
export const LANGUAGE_LABELS: Record<string, string> = {
    python: 'Python',
    java: 'Java',
    kotlin: 'Kotlin',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    swift: 'Swift',
    cpp: 'C++',
    'c++': 'C++',
    go: 'Go',
    rust: 'Rust',
    c: 'C',
    csharp: 'C#',
    'c#': 'C#',
    r: 'R',
    ruby: 'Ruby',
    scala: 'Scala',
    text: 'Text',
};

/**
 * 언어 이름을 정규화 (대소문자 무시, 공백 제거)
 */
export const normalizeLanguage = (language: string): string => {
    if (!language) return 'default';
    return language.toLowerCase().trim();
};

/**
 * 언어에 해당하는 색상 설정을 반환
 */
export const getLanguageColor = (language: string): LanguageColorConfig => {
    const normalized = normalizeLanguage(language);
    return LANGUAGE_COLORS[normalized] || LANGUAGE_COLORS.default;
};

/**
 * 언어에 해당하는 라벨을 반환
 */
export const getLanguageLabel = (language: string): string => {
    const normalized = normalizeLanguage(language);
    return LANGUAGE_LABELS[normalized] || language;
};

