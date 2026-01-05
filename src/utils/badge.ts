/**
 * 배지 색상 유틸리티 함수
 * Tier Badge와 Language Badge의 색상 스타일을 관리합니다.
 */

/**
 * 백준 온라인 저지(BOJ) 스타일의 Tier 색상을 반환합니다.
 * 배경색은 약간 연한 톤으로 조정, 텍스트는 흰색을 사용합니다.
 */
export const getTierBadgeColor = (tier: string): string => {
    const tierColors: Record<string, string> = {
        BRONZE: 'bg-[#AD5600]/80 text-white dark:bg-[#AD5600]/70 dark:text-white',
        SILVER: 'bg-[#435F7A]/80 text-white dark:bg-[#435F7A]/70 dark:text-white',
        GOLD: 'bg-[#EC9A00]/80 text-white dark:bg-[#EC9A00]/70 dark:text-white',
        PLATINUM: 'bg-[#27E2A4]/80 text-white dark:bg-[#27E2A4]/70 dark:text-white',
        DIAMOND: 'bg-[#00B4FC]/80 text-white dark:bg-[#00B4FC]/70 dark:text-white',
        RUBY: 'bg-[#FF0062]/80 text-white dark:bg-[#FF0062]/70 dark:text-white',
        UNRATED: 'bg-gray-400/80 text-white dark:bg-gray-500/70 dark:text-white',
    };
    return tierColors[tier.toUpperCase()] || tierColors.UNRATED;
};

/**
 * 프로그래밍 언어별 트렌디한 색상을 반환합니다.
 */
export const getLanguageBadgeColor = (language: string): string => {
    const languageColors: Record<string, string> = {
        // Python
        python: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
        // Java
        java: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        // Kotlin
        kotlin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        // JavaScript
        javascript: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        // TypeScript
        typescript: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        // Swift
        swift: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
        // C++
        cpp: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        'c++': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        // Go
        go: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
        // Rust
        rust: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
        // C
        c: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        // C#
        csharp: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
        'c#': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
        // R
        r: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        // Ruby
        ruby: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        // Scala
        scala: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        // Text/Other
        text: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    };
    return languageColors[language.toLowerCase()] || languageColors.text;
};

/**
 * 언어 이름을 표시용 라벨로 변환합니다.
 */
export const getLanguageLabel = (language: string): string => {
    const languageLabels: Record<string, string> = {
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
    return languageLabels[language.toLowerCase()] || language;
};

