import Card from '../common/Card'

interface ActivityData {
    date: string
    solved: number
}

interface ActivityGraphProps {
    data?: ActivityData[]
}

// GitHub 스타일 잔디 그래프를 위한 데이터 생성 (최근 7주, 주당 7일)
function generateContributionData(): { date: string; count: number }[] {
    const data: { date: string; count: number }[] = []
    const today = new Date()
    
    // 최근 49일 (7주)
    for (let i = 48; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
        
        // 랜덤하게 활동량 생성 (0~5)
        const count = Math.floor(Math.random() * 6)
        data.push({ date: dateStr, count })
    }
    
    return data
}

// 활동량에 따른 색상 결정
function getColorClass(count: number): string {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-green-200 dark:bg-green-900'
    if (count === 2) return 'bg-green-400 dark:bg-green-700'
    if (count === 3) return 'bg-green-500 dark:bg-green-600'
    if (count >= 4) return 'bg-green-600 dark:bg-green-500'
    return 'bg-gray-100 dark:bg-gray-800'
}

export default function ActivityGraph({ data }: ActivityGraphProps) {
    const contributionData = data 
        ? data.map(d => ({ date: d.date, count: d.solved }))
        : generateContributionData()
    
    // 7주 x 7일 = 49개 셀
    const weeks: { date: string; count: number }[][] = []
    for (let i = 0; i < 7; i++) {
        weeks.push(contributionData.slice(i * 7, (i + 1) * 7))
    }

    return (
        <Card>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                최근 풀이 활동
            </h2>
            <div className="flex items-end gap-1">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                            <div
                                key={`${weekIndex}-${dayIndex}`}
                                className={`w-3 h-3 rounded ${getColorClass(day.count)} transition-colors hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400`}
                                title={`${day.date}: ${day.count}문제 해결`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>최근 7주간의 활동</span>
                <div className="flex items-center gap-1">
                    <span className="mr-2">Less</span>
                    <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
                    <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700" />
                    <div className="w-3 h-3 rounded bg-green-500 dark:bg-green-600" />
                    <div className="w-3 h-3 rounded bg-green-600 dark:bg-green-500" />
                    <span className="ml-2">More</span>
                </div>
            </div>
        </Card>
    )
}
