/**
 * 티어 배지 컴포넌트 (백준 티어 이미지 표시)
 */

import { useState } from 'react';

interface TierBadgeProps {
    tierLevel: number; // Solved.ac 레벨 (1~30)
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tierLevel, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    
    // 티어 레벨이 유효한 범위인지 확인 (1~30)
    const validLevel = tierLevel >= 1 && tierLevel <= 30 ? tierLevel : 1;
    
    // 이미지 경로 생성
    const imagePath = `/tier-${validLevel}.svg`;
    
    // 크기 옵션에 따른 클래스
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    
    // Fallback 이모지 (티어별)
    const getFallbackEmoji = (level: number): string => {
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
                alt={`티어 레벨 ${validLevel}`}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

