import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'disabled'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
}

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    disabled,
    children,
    type = 'button',
    ...props
}: ButtonProps) {
    const isDisabled = disabled || variant === 'disabled'

    const baseStyles = 'rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variantStyles = {
        primary: isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: isDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
        disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
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
            className={clsx(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

