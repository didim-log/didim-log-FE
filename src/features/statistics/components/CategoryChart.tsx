/**
 * 카테고리 차트 컴포넌트
 */

interface CategoryChartProps {
    data: Record<string, number>;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const maxCount = entries.length > 0 ? entries[0][1] : 1;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">카테고리별 분포</h2>
            {entries.length > 0 ? (
                <div className="space-y-3">
                    {entries.map(([category, count]) => (
                        <div key={category} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{count}문제</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">데이터가 없습니다.</p>
            )}
        </div>
    );
};

