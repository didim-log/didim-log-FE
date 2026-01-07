/**
 * 메인 프로필 카드 컴포넌트
 */

import type { FC } from 'react';
import { TierBadge } from '../../dashboard/components/TierBadge';
import { Button } from '../../../components/ui/Button';
import { Edit2 } from 'lucide-react';
import { formatTier, getTierColor, resolveSolvedAcTierLevel } from '../../../utils/tier';
import type { DashboardResponse } from '../../../types/api/dashboard.types';
import { getLanguageLabel, getLanguageColor } from '../../../constants/languageColors';

interface ProfileCardProps {
    dashboard: DashboardResponse;
    primaryLanguage?: string | null;
    onEdit: () => void;
}


export const ProfileCard: FC<ProfileCardProps> = ({ dashboard, primaryLanguage, onEdit }) => {
    const { studentProfile, currentRating } = dashboard;
    // 백엔드가 tierLevel을 정확한 solved.ac 단계(0~31)로 내려주므로 직접 사용
    // 안전을 위해 fallback은 유지
    const tierLevel = resolveSolvedAcTierLevel({
        tierLevel: studentProfile.currentTierLevel,
        rating: currentRating,
    });
    const isUnrated = studentProfile.currentTier === 'UNRATED' || tierLevel === 0;
    const tierTitle = isUnrated ? 'Unrated' : formatTier(tierLevel);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-6">
                {/* 좌측: 티어 이미지 */}
                <div className="flex-shrink-0">
                    <TierBadge tierLevel={tierLevel} size="lg" />
                </div>

                {/* 중앙: 사용자 정보 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            {/* 닉네임 */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {studentProfile.nickname}
                            </h1>
                            
                            {/* BOJ ID */}
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                @{studentProfile.bojId}
                            </p>

                            {/* 티어 및 주 언어 */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getTierColor(tierTitle.split(' ')[0] || 'UNRATED')}`}>
                                    {tierTitle}
                                </span>

                                {/* 온보딩 투어 타겟은 로딩/미설정 상황에서도 항상 DOM에 존재해야 합니다. */}
                                <div className="tour-language-badge">
                                    {primaryLanguage && primaryLanguage !== 'TEXT' ? (() => {
                                        const languageColors = getLanguageColor(primaryLanguage);
                                        return (
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${languageColors.bg} ${languageColors.text} ${languageColors.darkBg} ${languageColors.darkText}`}>
                                                {getLanguageLabel(primaryLanguage)}
                                            </span>
                                        );
                                    })() : (
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium">
                                            언어 미설정
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 우측 상단: 수정 버튼 */}
                        <div className="flex-shrink-0">
                            <Button
                                onClick={onEdit}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                수정
                            </Button>
                        </div>
                    </div>

                    {/* 연속 풀이 일수 */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">연속 풀이</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {studentProfile.consecutiveSolveDays}일
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


