/**
 * 입력 컴포넌트
 */

import type { FC, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: FC<InputProps> = ({ label, error, className, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-400',
                    error 
                        ? 'border-red-500 dark:border-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};


