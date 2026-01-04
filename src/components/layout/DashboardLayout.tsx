import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { useTheme } from '../../contexts/useTheme'

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
        if (window.confirm('로그아웃 하시겠습니까?')) {
            navigate('/')
        }
    }

    return (
        // 1. 전체 배경색 설정 (화면 꽉 채우기)
        <div className={`${fullHeight ? 'h-screen' : 'min-h-screen'} w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
            
            {/* 2. 헤더 (네비게이션) */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                    
                    {/* 로고 */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer bg-transparent hover:bg-transparent border-none p-0"
                    >
                        디딤로그
                    </button>

                    {/* 우측 메뉴 (테마토글, 마이페이지, 로그아웃) */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleTheme()
                            }}
                            title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
                            type="button"
                            className="p-2"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/mypage')}
                            className="flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">내 정보</span>
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">로그아웃</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* 3. 메인 콘텐츠 영역 (여기가 핵심!) */}
            {/* mx-auto: 좌우 여백 자동(중앙 정렬) */}
            {/* max-w-7xl: 너무 넓어지지 않게 제한 */}
            {/* w-full: 전체 너비 사용 */}
            {/* px-4: 모바일에서 양옆 여백 확보 */}
            {/* flex, flex-col, items-center: 내부 콘텐츠 수평 중앙 정렬 */}
            <main className={`mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center ${fullHeight ? 'flex-1 overflow-hidden justify-center' : 'py-8'}`}>
                {children}
            </main>
            
        </div>
    )
}
