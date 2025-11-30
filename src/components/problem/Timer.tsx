import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import Button from '../common/Button'

interface TimerProps {
    onTimeUpdate?: (seconds: number) => void
    shouldPause?: boolean
}

export default function Timer({ onTimeUpdate, shouldPause = false }: TimerProps) {
    const [seconds, setSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (shouldPause) {
            setIsRunning(false)
        }
    }, [shouldPause])

    useEffect(() => {
        if (isRunning && !shouldPause) {
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
    }, [isRunning, shouldPause, onTimeUpdate])

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

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    const timerColor = isRunning
        ? 'text-blue-600'
        : 'text-gray-500'

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                타이머
            </h3>
            <div className="flex items-center justify-between">
                <div
                    className={`text-4xl font-bold ${timerColor} transition-colors`}
                >
                    {formatTime(seconds)}
                </div>
                <div className="flex gap-2">
                    {isRunning ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handlePause}
                            className="flex items-center gap-2"
                        >
                            <Pause className="w-4 h-4" />
                            일시정지
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleResume}
                            className="flex items-center gap-2"
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

