import type { FC } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
    const { theme, toggleTheme } = useUIStore();

    const title = theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="테마 변경"
            title={title}
            className={cn(
                'p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                className
            )}
        >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
    );
};
