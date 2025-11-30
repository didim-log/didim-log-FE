import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
    isLoading?: boolean
}

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    className,
    disabled,
    children,
    type = 'button',
    ...props
}: ButtonProps) {
    const isDisabled = disabled || isLoading

    const baseStyles = 'rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    
    const variantStyles = {
        primary: isDisabled
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500',
        secondary: isDisabled
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
        outline: isDisabled
            ? 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-transparent'
            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500',
        danger: isDisabled
            ? 'bg-red-300 dark:bg-red-900 text-red-500 dark:text-red-400'
            : 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500',
        ghost: isDisabled
            ? 'text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800'
            : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
    }

    const sizeStyles = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
    }

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    )
}

