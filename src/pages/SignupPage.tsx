import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import SignupWizard from '../components/auth/SignupWizard'
import { saveToken } from '../utils/auth'

/**
 * OAuth 회원가입 마무리 state 타입
 */
interface OAuthSignupState {
    email: string
    provider: string
    providerId: string
}

export default function SignupPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // OAuth 정보 확인 (소셜 로그인으로 온 경우)
    const state = location.state as OAuthSignupState | null
    const isOAuthMode = !!state?.provider && !!state?.providerId

    // 뒤로가기 처리
    useEffect(() => {
        const handlePopState = () => {
            // 뒤로가기 시 로그인 페이지로 이동
            if (window.history.state && window.history.state.idx > 0) {
                navigate('/')
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [navigate])

    const handleSignupComplete = (token: string) => {
        saveToken(token)
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['statistics'] })
        toast.success('회원가입이 완료되었습니다!')
        navigate('/dashboard', { replace: true })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        디딤로그
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        회원가입을 완료하세요
                    </p>
                </div>

                {isOAuthMode && state ? (
                    <SignupWizard
                        email={state.email || ''}
                        provider={state.provider}
                        providerId={state.providerId}
                        onComplete={handleSignupComplete}
                    />
                ) : (
                    // BOJ 회원가입 모드
                    <SignupWizard
                        email=""
                        provider="BOJ"
                        providerId=""
                        onComplete={handleSignupComplete}
                    />
                )}
            </div>
        </div>
    )
}

