/**
 * 티어 배지 컴포넌트 (백준 티어 이미지 표시)
 */

import { useState } from 'react';
import type { FC } from 'react';

interface TierBadgeProps {
    tierLevel: number; // Solved.ac 레벨 (1~30)
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const TierBadge: FC<TierBadgeProps> = ({ tierLevel, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    
    // UNRATED 처리: tierLevel이 0이거나 undefined이거나 유효하지 않은 경우
    const isUnrated = !tierLevel || tierLevel <= 0 || tierLevel > 30;
    
    // 크기 옵션에 따른 클래스
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    
    // 티어 레벨 결정: UNRATED는 0, 그 외는 1~30 범위로 제한
    const validLevel = isUnrated ? 0 : (tierLevel >= 1 && tierLevel <= 30 ? tierLevel : 1);
    
    // 이미지 경로 생성 (UNRATED는 tier-0.svg 사용)
    const imagePath = `/tier-${validLevel}.svg`;
    
    // Fallback 이모지 (티어별)
    const getFallbackEmoji = (level: number): string => {
        if (level === 0) return '⚪'; // UNRATED
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
                alt={isUnrated ? 'Unrated 티어' : `티어 레벨 ${validLevel}`}
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

