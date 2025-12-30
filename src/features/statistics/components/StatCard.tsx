/**
 * 통계 지표 카드 컴포넌트
 */

import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
    borderColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconColor,
    bgColor,
    borderColor,
}) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border ${borderColor}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                        {title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className={`p-1.5 ${bgColor} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};

