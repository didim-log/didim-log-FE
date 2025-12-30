import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saveToken } from '../utils/auth'
import { Loading } from '../components/common/Loading'

/**
 * OAuth2 콜백 페이지
 * 백엔드에서 리다이렉트된 후 토큰을 받아 처리하는 페이지
 */
export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const resolveOauthErrorMessage = (
        error: string,
        errorDescription: string | null
    ): string => {
        if (error === 'invalid_provider') {
            return '지원하지 않는 로그인 제공자입니다. 다시 시도해주세요.'
        }
        if (error === 'access_denied') {
            return (
                errorDescription ||
                '로그인이 취소되었습니다. 다시 시도해주세요.'
            )
        }
        return errorDescription || '소셜 로그인에 실패했습니다. 다시 시도해주세요.'
    }

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // URL 쿼리 파라미터에서 값 추출
                const token = searchParams.get('token')
                const isNewUser = searchParams.get('isNewUser')
                const error = searchParams.get('error')
                const errorDescription = searchParams.get('error_description')

                // 에러 처리
                if (error) {
                    toast.error(resolveOauthErrorMessage(error, errorDescription))
                    navigate('/login', {
                        replace: true,
                        state: {
                            returnTo: '/login',
                        },
                    })
                    return
                }

                // 신규 유저 처리
                if (isNewUser === 'true') {
                    const email = searchParams.get('email') || ''
                    const provider = searchParams.get('provider')
                    const providerId = searchParams.get('providerId')

                    if (!provider || !providerId) {
                        toast.error('회원가입 정보를 받지 못했습니다. 다시 시도해주세요.')
                        navigate('/')
                        return
                    }

                    // 회원가입 마무리 페이지로 이동 (state로 정보 전달)
                    navigate('/signup', {
                        replace: false, // push로 이동하여 뒤로가기 가능
                        state: {
                            email: email || '',
                            provider,
                            providerId,
                        },
                    })
                    return
                }

                // 기존 유저 처리
                if (!token) {
                    toast.error('인증 토큰을 받지 못했습니다. 다시 시도해주세요.')
                    navigate('/login', { replace: true })
                    return
                }

                // 토큰 저장
                saveToken(token)

                // React Query 캐시 무효화하여 사용자 정보 갱신
                queryClient.invalidateQueries({ queryKey: ['dashboard'] })
                queryClient.invalidateQueries({ queryKey: ['statistics'] })

                // 기존 사용자는 대시보드로
                toast.success('로그인에 성공했습니다!')
                navigate('/dashboard', { replace: true })
            } catch {
                toast.error('로그인 처리 중 오류가 발생했습니다.')
                navigate('/login', { replace: true })
            }
        }

        handleCallback()
    }, [searchParams, navigate, queryClient])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <Loading />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    로그인 중입니다...
                </p>
            </div>
        </div>
    )
}

