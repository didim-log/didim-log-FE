import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Crown, Medal } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import TierBadge from '../components/dashboard/TierBadge'
import Card from '../components/common/Card'
import { Loading } from '../components/common/Loading'
import { getRankings } from '../apis/rankingApi'
import { getDashboard } from '../apis/dashboardApi'
import { isAuthenticated } from '../utils/auth'
import type { RankingResponse, DashboardResponse, RankingPeriod } from '../types/api/dtos'
import { getTierFromString } from '../types/tier'

export default function RankingPage() {
    const navigate = useNavigate()
    const [period, setPeriod] = useState<RankingPeriod>('TOTAL')

    // 인증 확인
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/')
        }
    }, [navigate])

    // 랭킹 데이터 조회
    const {
        data: rankings = [],
        isLoading: isRankingsLoading,
        error: rankingsError,
    } = useQuery<RankingResponse[]>({
        queryKey: ['rankings', period],
        queryFn: () => getRankings(100, period),
        enabled: isAuthenticated(),
        retry: 1,
    })

    // 현재 사용자 정보 조회 (내 순위 하이라이트용)
    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
    } = useQuery<DashboardResponse>({
        queryKey: ['dashboard'],
        queryFn: () => getDashboard(), // JWT 토큰에서 자동 추출
        enabled: isAuthenticated(),
        retry: 1,
    })

    const isLoading = isRankingsLoading || isDashboardLoading
    const currentUserNickname = dashboardData?.studentProfile.nickname

    // Top 3와 나머지 분리
    const top3 = rankings.slice(0, 3)
    const restRankings = rankings.slice(3)

    // 메달 색상 및 아이콘
    const medalConfig = [
        { rank: 1, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-300 dark:border-yellow-700', icon: Crown },
        { rank: 2, color: 'text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800/50', borderColor: 'border-gray-300 dark:border-gray-700', icon: Medal },
        { rank: 3, color: 'text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-300 dark:border-orange-700', icon: Medal },
    ]

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loading />
                </div>
            </DashboardLayout>
        )
    }

    if (rankingsError) {
        return (
            <DashboardLayout>
                <Card>
                    <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            랭킹 데이터를 불러오는데 실패했습니다.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            대시보드로 돌아가기
                        </button>
                    </div>
                </Card>
            </DashboardLayout>
        )
    }

    const periodLabels: Record<RankingPeriod, string> = {
        DAILY: '일간',
        WEEKLY: '주간',
        MONTHLY: '월간',
        TOTAL: '전체',
    }

    return (
        <DashboardLayout>
            <div className="w-full space-y-8">
                {/* 상단 배너 */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                명예의 전당
                            </h1>
                            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium">
                                꾸준한 회고가 성장의 지름길입니다
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                회고 작성 수 기준 상위 랭킹을 확인하세요
                            </p>
                        </div>
                        <div className="text-6xl md:text-7xl">📚</div>
                    </div>
                </Card>

                {/* 기간 필터 탭 */}
                <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
                    {(['DAILY', 'WEEKLY', 'MONTHLY', 'TOTAL'] as RankingPeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-3 text-sm font-semibold transition-all ${
                                period === p
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[2px]'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            {periodLabels[p]}
                        </button>
                    ))}
                </div>

                {/* Top 3 강조 UI */}
                {top3.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {top3.map((ranking, index) => {
                            const config = medalConfig[index]
                            const MedalIcon = config.icon
                            const tier = getTierFromString(ranking.tier)
                            const isCurrentUser = ranking.nickname === currentUserNickname

                            return (
                                <Card
                                    key={ranking.rank}
                                    className={`relative overflow-hidden ${config.bgColor} ${config.borderColor} border-2 ${isCurrentUser ? 'ring-4 ring-blue-500 dark:ring-blue-400 shadow-lg' : ''} transition-all hover:scale-105`}
                                >
                                    {/* 순위 배지 */}
                                    <div className="absolute top-4 right-4">
                                        <MedalIcon className={`w-10 h-10 ${config.color}`} />
                                    </div>

                                    {/* 내 순위 표시 */}
                                    {isCurrentUser && (
                                        <div className="absolute top-2 left-2 bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                                            나
                                        </div>
                                    )}

                                    <div className="pt-12 pb-6 text-center">
                                        {/* 프로필 이미지 (크게) */}
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {ranking.nickname.charAt(0).toUpperCase()}
                                        </div>

                                        {/* 닉네임 */}
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                                            {ranking.nickname}
                                        </h3>

                                        {/* 티어 배지 */}
                                        <div className="flex justify-center mb-4">
                                            <TierBadge
                                                tier={tier}
                                                level={ranking.tierLevel}
                                                rating={ranking.rating}
                                            />
                                        </div>

                                        {/* 회고 작성 수 (강조) */}
                                        <div className="mb-3">
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {ranking.retrospectiveCount}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                개 회고 작성
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Rating: {ranking.rating.toLocaleString()}
                                        </div>

                                        {/* 순위 */}
                                        <div className={`text-2xl font-bold ${config.color} mt-3`}>
                                            {ranking.rank}위
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* 랭킹 리스트 (Table) - 4위부터 */}
                {restRankings.length > 0 && (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            전체 랭킹
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            순위
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            유저
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Rating
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            회고 수
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            연속 일수
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restRankings.map((ranking) => {
                                        const tier = getTierFromString(ranking.tier)
                                        const isCurrentUser = ranking.nickname === currentUserNickname

                                        return (
                                            <tr
                                                key={ranking.rank}
                                                className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                                    isCurrentUser
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold'
                                                        : ''
                                                }`}
                                            >
                                                <td className="py-3 px-4">
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {ranking.rank}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                                            {ranking.nickname.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <TierBadge
                                                                tier={tier}
                                                                level={ranking.tierLevel}
                                                                rating={ranking.rating}
                                                            />
                                                            <span className="text-gray-800 dark:text-gray-200">
                                                                {ranking.nickname}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className="text-xs bg-blue-500 dark:bg-blue-600 text-white px-2 py-0.5 rounded">
                                                    나
                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                        {ranking.rating.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {ranking.retrospectiveCount}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {ranking.consecutiveSolveDays}일
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* 랭킹이 비어있는 경우 */}
                {rankings.length === 0 && (
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">
                                아직 랭킹 데이터가 없습니다.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}










