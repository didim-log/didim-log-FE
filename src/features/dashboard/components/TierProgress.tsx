/**
 * 티어 진행률 시각화 컴포넌트
 */

import { useState } from 'react';
import type { FC } from 'react';
import type { DashboardResponse } from '../../../types/api/dashboard.types';
import { TierBadge } from './TierBadge';
import { LanguageBadge } from '../../../components/common/LanguageBadge';
import { RefreshCw } from 'lucide-react';
import { useSyncBojProfile } from '../../../hooks/api/useStudent';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../types/api/common.types';
import { formatTier, resolveSolvedAcTierLevel, getTierMinRating } from '../../../utils/tier';

interface TierProgressProps {
    dashboard: DashboardResponse;
}

export const TierProgress: FC<TierProgressProps> = ({ dashboard }) => {
    const syncMutation = useSyncBojProfile();
    const [isSyncing, setIsSyncing] = useState(false);

    // 데이터 안전장치: dashboard 또는 studentProfile이 없는 경우
    if (!dashboard || !dashboard.studentProfile) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">대시보드 데이터를 불러오는 중...</p>
            </div>
        );
    }

    const { nextTierTitle, currentRating, requiredRatingForNextTier, progressPercentage } = dashboard;
    const { nickname, currentTierLevel, consecutiveSolveDays, currentTier } = dashboard.studentProfile;
    
    // 백엔드가 tierLevel을 정확한 solved.ac 단계(0~31)로 내려주므로 직접 사용
    // 안전을 위해 fallback은 유지
    const displayTierLevel = resolveSolvedAcTierLevel({
        tierLevel: currentTierLevel ?? 0,
        rating: currentRating ?? 0,
    });

    // UNRATED 처리: tierLevel이 0이거나 currentTier가 UNRATED인 경우
    const isUnrated = displayTierLevel === 0 || currentTier === 'UNRATED';
    
    // UNRATED일 때 다음 목표 티어 정보 (Bronze V = 레벨 1)
    const UNRATED_NEXT_TIER_TITLE = formatTier(1);
    const UNRATED_NEXT_TIER_RATING = getTierMinRating(1);
    const unratedCurrentRating = currentRating ?? 0;
    const unratedRequiredRating = UNRATED_NEXT_TIER_RATING;
    const unratedProgressPercentage = Math.min(100, Math.max(0, (unratedCurrentRating / unratedRequiredRating) * 100));

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncMutation.mutateAsync();
            // 동기화 성공 시 localStorage에 시간 저장
            localStorage.setItem('boj_last_sync_time', Date.now().toString());
            toast.success('최신 정보를 가져왔습니다.');
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
                {/* 사용자 정보 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {nickname || '사용자'}
                        </h2>
                        {dashboard.studentProfile.primaryLanguage && dashboard.studentProfile.primaryLanguage !== 'TEXT' && (
                            <LanguageBadge language={dashboard.studentProfile.primaryLanguage} size="sm" />
                        )}
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || syncMutation.isPending}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="BOJ 정보 동기화"
                        aria-label="BOJ 정보 동기화"
                    >
                        <RefreshCw
                            className={`w-5 h-5 ${isSyncing || syncMutation.isPending ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>

                {/* 티어 정보 */}
                <div className="flex items-center gap-3">
                    <TierBadge tierLevel={displayTierLevel} size="lg" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {isUnrated ? 'Unrated' : formatTier(displayTierLevel)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{currentRating ?? 0}pt</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isUnrated ? `다음 목표: ${UNRATED_NEXT_TIER_TITLE}` : `다음 목표: ${nextTierTitle || 'Unknown'}`}
                        </p>
                    </div>
                </div>

                {/* 진행률 바 - 모든 사용자에게 표시 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {isUnrated 
                                ? `${unratedCurrentRating} / ${unratedRequiredRating} pt`
                                : `${currentRating ?? 0} / ${requiredRatingForNextTier ?? 0} pt`
                            }
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 font-bold">
                            {isUnrated 
                                ? `${Math.round(unratedProgressPercentage)}%`
                                : `${progressPercentage ?? 0}%`
                            }
                        </span>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
                        {/* Blue → Purple → Pink 그라데이션 */}
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-lg"
                            style={{ 
                                width: `${isUnrated ? unratedProgressPercentage : (progressPercentage ?? 0)}%` 
                            }}
                        >
                            {/* Shimmer 애니메이션 효과 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                        
                        {/* 다음 티어까지 남은 포인트 텍스트 오버레이 */}
                        {(() => {
                            const displayProgress = isUnrated ? unratedProgressPercentage : (progressPercentage ?? 0);
                            const remainingPoints = isUnrated 
                                ? unratedRequiredRating - unratedCurrentRating
                                : (requiredRatingForNextTier ?? 0) - (currentRating ?? 0);
                            
                            return displayProgress < 100 && remainingPoints > 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white drop-shadow-md">
                                        다음 티어까지 {remainingPoints}pt 남음
                                    </span>
                                </div>
                            ) : null;
                        })()}
                    </div>
                    {/* UNRATED 사용자를 위한 안내 메시지 */}
                    {isUnrated && (
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400 italic">
                            첫 문제를 풀어 티어를 획득하세요!
                        </p>
                    )}
                </div>

                {/* 연속 풀이 일수 */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        연속 풀이: <span className="font-semibold text-gray-900 dark:text-white">{consecutiveSolveDays ?? 0}일</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
