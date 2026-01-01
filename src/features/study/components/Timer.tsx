/**
 * 타이머 컴포넌트
 */

import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface TimerProps {
    isRunning: boolean;
    onTimeUpdate?: (seconds: number) => void;
}

export const Timer: FC<TimerProps> = ({ isRunning, onTimeUpdate }) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                const newSeconds = prev + 1;
                onTimeUpdate?.(newSeconds);
                return newSeconds;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, onTimeUpdate]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{formatTime(seconds)}</span>
        </div>
    );
};


