/**
 * 티어 배지 컴포넌트 (백준 티어 이미지 표시)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { formatTier } from '../../../utils/tier';

interface TierBadgeProps {
    tierLevel: number; // Solved.ac Tier 정수 (0~31)
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const TierBadge: FC<TierBadgeProps> = ({ tierLevel, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    
    // UNRATED 처리: tierLevel이 0이거나 유효하지 않은 경우
    // (Solved.ac: 0=Unrated, 1~30=Bronze~Ruby, 31=Master)
    const isUnrated = tierLevel <= 0 || tierLevel > 31;
    
    // 크기 옵션에 따른 클래스
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    
    // 티어 레벨 결정: Unrated는 0, 그 외는 1~31 범위로 제한
    const validLevel = isUnrated ? 0 : (tierLevel >= 1 && tierLevel <= 31 ? tierLevel : 1);
    
    // 이미지 경로 생성 (UNRATED는 tier-0.svg 사용)
    const imagePath = `/tier-${validLevel}.svg`;
    const altText = isUnrated ? 'Unrated 티어' : formatTier(validLevel);
    
    // Fallback 이모지 (티어별)
    const getFallbackEmoji = (level: number): string => {
        if (level === 0) return '⚪'; // UNRATED
        if (level === 31) return '👑'; // MASTER
        if (level >= 26) return '❤️'; // RUBY
        if (level >= 21) return '💠'; // DIAMOND
        if (level >= 16) return '💎'; // PLATINUM
        if (level >= 11) return '🛡️'; // GOLD
        if (level >= 6) return '🥈'; // SILVER
        return '🥉'; // BRONZE
    };
    
    // 이미지 로딩 실패 시 fallback 표시
    if (imageError) {
        return (
            <div className={`${sizeClasses[size]} flex items-center justify-center text-4xl ${className}`}>
                {getFallbackEmoji(validLevel)}
            </div>
        );
    }
    
    return (
        <div className={`${sizeClasses[size]} relative ${className}`}>
            <img
                src={imagePath}
                alt={altText}
                className="w-full h-full object-contain"
                onError={(e) => {
                    // 이미지 로드 실패 시 solved.ac 공식 URL로 fallback
                    const target = e.target as HTMLImageElement;
                    if (target.src !== `https://static.solved.ac/tier_small/${validLevel}.svg`) {
                        target.src = `https://static.solved.ac/tier_small/${validLevel}.svg`;
                        // solved.ac URL도 실패하면 이모지 표시
                        target.onerror = () => setImageError(true);
                    } else {
                        setImageError(true);
                    }
                }}
            />
        </div>
    );
};
