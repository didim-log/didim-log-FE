import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

const BOJ_ID_PATTERN = /^[a-zA-Z0-9_]*$/

export default function LoginPage() {
    const [bojId, setBojId] = useState('')
    const navigate = useNavigate()

    const isValidBojId = bojId.length > 0 && BOJ_ID_PATTERN.test(bojId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValidBojId) {
            return
        }
        navigate('/dashboard')
    }

    const handleBojIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || BOJ_ID_PATTERN.test(value)) {
            setBojId(value)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        DidimLog
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        체계적인 알고리즘 학습을 시작하세요
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Input
                                label="BOJ ID"
                                type="text"
                                value={bojId}
                                onChange={handleBojIdChange}
                                placeholder="백준 온라인 저지 ID를 입력하세요"
                                helperText="영문, 숫자, 언더스코어(_)만 사용 가능합니다"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={!isValidBojId}
                        >
                            시작하기
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

