import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BOJ_ID_PATTERN = /^[a-zA-Z0-9_]+$/

export default function LoginPage() {
    const [bojId, setBojId] = useState('')
    const navigate = useNavigate()

    const isValidBojId = bojId.length > 0 && BOJ_ID_PATTERN.test(bojId)
    const isButtonDisabled = !isValidBojId

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isButtonDisabled) {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md px-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">
                        DidimLog
                    </h1>
                    <p className="text-gray-600">
                        체계적인 알고리즘 학습을 시작하세요
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg shadow-md p-8"
                >
                    <div className="mb-6">
                        <label
                            htmlFor="bojId"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            BOJ ID
                        </label>
                        <input
                            id="bojId"
                            type="text"
                            value={bojId}
                            onChange={handleBojIdChange}
                            placeholder="백준 온라인 저지 ID를 입력하세요"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            영문, 숫자, 언더스코어(_)만 사용 가능합니다
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                            isButtonDisabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }`}
                    >
                        시작하기
                    </button>
                </form>
            </div>
        </div>
    )
}

