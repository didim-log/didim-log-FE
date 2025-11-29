import { forwardRef } from 'react'
import { clsx } from 'clsx'

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
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition',
                        error
                            ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-xs text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-xs text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input

