import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean
}

export default function Card({
    hoverable = false,
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6',
                hoverable && 'transition-shadow hover:shadow-lg cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

