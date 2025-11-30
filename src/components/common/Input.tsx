import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                        error
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input

