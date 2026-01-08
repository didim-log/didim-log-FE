import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatTimeToClock } from '../../utils/dateUtils'

interface TimerProps {
    onTimeUpdate?: (seconds: number) => void
    shouldPause?: boolean
}

export default function Timer({ onTimeUpdate, shouldPause = false }: TimerProps) {
    const [seconds, setSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(true)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const isActive = isRunning && !shouldPause

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    const newSeconds = prev + 1
                    if (onTimeUpdate) {
                        onTimeUpdate(newSeconds)
                    }
                    return newSeconds
                })
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isActive, onTimeUpdate])

    const handlePause = () => {
        setIsRunning(false)
    }

    const handleResume = () => {
        setIsRunning(true)
    }

    const handleReset = () => {
        setSeconds(0)
        setIsRunning(true)
        if (onTimeUpdate) {
            onTimeUpdate(0)
        }
    }


    const timerColor = isActive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-500 dark:text-gray-400'

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                타이머
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div
                    className={`text-3xl sm:text-4xl font-bold ${timerColor} transition-colors`}
                >
                    {formatTimeToClock(seconds)}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {isActive ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handlePause}
                            className="tour-timer-btn flex items-center gap-2"
                        >
                            <Pause className="w-4 h-4" />
                            일시정지
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleResume}
                            disabled={shouldPause}
                            className="tour-timer-btn flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            재개
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleReset}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        초기화
                    </Button>
                </div>
            </div>
        </div>
    )
}
