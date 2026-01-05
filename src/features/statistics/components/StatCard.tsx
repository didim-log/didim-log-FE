/**
 * 통계 지표 카드 컴포넌트 (컴팩트 버전)
 * 트렌드 인디케이터 추가, 세로 패딩 최소화
 */

import type { FC, ComponentType } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    trend?: {
        value: number;
        label?: string;
    };
}

export const StatCard: FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconColor,
    bgColor,
    borderColor,
    trend,
}) => {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) {
            return <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />;
        }
        if (trend.value < 0) {
            return <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />;
        }
        return <Minus className="w-3 h-3 text-gray-400 dark:text-gray-500" />;
    };

    const getTrendColor = () => {
        if (!trend) return '';
        if (trend.value > 0) {
            return 'text-green-600 dark:text-green-400';
        }
        if (trend.value < 0) {
            return 'text-red-600 dark:text-red-400';
        }
        return 'text-gray-500 dark:text-gray-400';
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md py-2 px-3 border ${borderColor}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                            {title}
                        </p>
                        {trend && (
                            <div className="flex items-center gap-0.5">
                                {getTrendIcon()}
                                <span className={`text-[9px] font-medium ${getTrendColor()}`}>
                                    {trend.value > 0 ? '+' : ''}
                                    {trend.value !== 0 ? Math.abs(trend.value) : '0'}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    {trend?.label && (
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {trend.label}
                        </p>
                    )}
                </div>
                <div className={`p-1.5 ${bgColor} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};
