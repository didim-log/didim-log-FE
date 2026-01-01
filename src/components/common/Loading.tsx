interface LoadingProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Loading({ size = 'md', className }: LoadingProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    return (
        <div className={className}>
            <svg
                className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    )
}

export function FullScreenLoading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
            <div className="flex flex-col items-center gap-4">
                <Loading size="lg" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">로딩 중...</p>
            </div>
        </div>
    )
}


