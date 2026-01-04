/**
 * 타이머 컴포넌트
 */

import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';

interface TimerProps {
    isRunning: boolean;
    onTimeUpdate?: (seconds: number) => void;
}

export const Timer: FC<TimerProps> = ({ isRunning, onTimeUpdate }) => {
    const [seconds, setSeconds] = useState(0);
    const onTimeUpdateRef = useRef(onTimeUpdate);

    // 최신 콜백 참조 유지 (의존성 배열 문제 해결)
    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate;
    }, [onTimeUpdate]);

    // 타이머 실행 로직
    useEffect(() => {
        if (!isRunning) {
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    // seconds가 변경될 때마다 부모 컴포넌트에 알림 (렌더링 완료 후 실행)
    useEffect(() => {
        if (onTimeUpdateRef.current) {
            onTimeUpdateRef.current(seconds);
        }
    }, [seconds]);

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
        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
            {formatTime(seconds)}
        </span>
    );
};


