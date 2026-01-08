import { Search, Filter } from 'lucide-react'

// 주요 카테고리 목록 (백엔드 ProblemCategory Enum의 englishName 기준)
const CATEGORIES = [
    { value: '', label: '전체' },
    { value: 'MATHEMATICS', label: '수학' },
    { value: 'IMPLEMENTATION', label: '구현' },
    { value: 'DP', label: '다이나믹 프로그래밍' },
    { value: 'DATA_STRUCTURES', label: '자료구조' },
    { value: 'GRAPH_THEORY', label: '그래프 이론' },
    { value: 'GREEDY', label: '그리디 알고리즘' },
    { value: 'STRING', label: '문자열' },
    { value: 'BFS', label: '너비 우선 탐색' },
    { value: 'DFS', label: '깊이 우선 탐색' },
    { value: 'BINARY_SEARCH', label: '이분 탐색' },
    { value: 'SORTING', label: '정렬' },
    { value: 'TREE', label: '트리' },
    { value: 'GEOMETRY', label: '기하학' },
    { value: 'SIMULATION', label: '시뮬레이션' },
]

export type SortOption = 'latest' | 'oldest' | 'bookmarked'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'bookmarked', label: '즐겨찾기순' },
]

interface RetrospectiveFilterBarProps {
    keyword: string
    category: string
    sort: SortOption
    onKeywordChange: (keyword: string) => void
    onCategoryChange: (category: string) => void
    onSortChange: (sort: SortOption) => void
}

export default function RetrospectiveFilterBar({
    keyword,
    category,
    sort,
    onKeywordChange,
    onCategoryChange,
    onSortChange,
}: RetrospectiveFilterBarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Filter className="w-4 h-4" />
                <span>필터 및 정렬</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 검색창 */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => onKeywordChange(e.target.value)}
                        placeholder="제목/내용 검색..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                </div>

                {/* 카테고리 필터 */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="category-filter"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                        카테고리:
                    </label>
                    <select
                        id="category-filter"
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 정렬 드롭다운 */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="sort-filter"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                        정렬:
                    </label>
                    <select
                        id="sort-filter"
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}
