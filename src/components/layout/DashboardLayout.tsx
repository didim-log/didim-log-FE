import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Button from '../common/Button'

interface DashboardLayoutProps {
    children: React.ReactNode
    fullHeight?: boolean
}

export default function DashboardLayout({
    children,
    fullHeight = false,
}: DashboardLayoutProps) {
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/')
    }

    return (
        <div className={`${fullHeight ? 'h-screen' : 'min-h-screen'} bg-gray-50 flex flex-col`}>
            <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">
                                DidimLog
                            </h1>
                        </div>
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
            </nav>

            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${fullHeight ? 'flex-1 overflow-hidden' : 'py-8'}`}>
                {children}
            </main>
        </div>
    )
}

