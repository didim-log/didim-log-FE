import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun } from 'lucide-react'
import Button from '../common/Button'
import { useTheme } from '../../contexts/ThemeContext'

interface DashboardLayoutProps {
    children: React.ReactNode
    fullHeight?: boolean
}

export default function DashboardLayout({
    children,
    fullHeight = false,
}: DashboardLayoutProps) {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

    const handleLogout = () => {
        navigate('/')
    }

    return (
        <div className={`${fullHeight ? 'h-screen' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900 flex flex-col`}>
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer bg-transparent hover:bg-transparent border-none p-0"
                            >
                                DidimLog
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleTheme()
                                }}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
                                type="button"
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-5 h-5" />
                                ) : (
                                    <Sun className="w-5 h-5" />
                                )}
                            </button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleLogout}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${fullHeight ? 'flex-1 overflow-hidden' : 'py-8'}`}>
                {children}
            </main>
        </div>
    )
}

