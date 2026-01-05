import type { FC } from 'react';

interface OnlyKoreanToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

export const OnlyKoreanToggle: FC<OnlyKoreanToggleProps> = ({ value, onChange, disabled = false }) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">한국어 문제만</span>
        </label>
    );
};


