import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Timer from '../components/problem/Timer'
import ResultModal from '../components/problem/ResultModal'
import TierBadge from '../components/dashboard/TierBadge'
import Button from '../components/common/Button'
import { Tier } from '../types/tier'

interface Problem {
    id: string
    title: string
    tier: Tier
    category: string
    content: string
    inputExample: string
    outputExample: string
}

const mockProblem: Problem = {
    id: '1000',
    title: 'A+B',
    tier: Tier.BRONZE,
    category: 'IMPLEMENTATION',
    content: `두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하세요.

## 입력
첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)

## 출력
첫째 줄에 A+B를 출력한다.`,
    inputExample: '1 2',
    outputExample: '3',
}

export default function ProblemPage() {
    const { problemId } = useParams<{ problemId: string }>()
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [timeTaken, setTimeTaken] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const problem = mockProblem

    const handleTimeUpdate = (seconds: number) => {
        setTimeTaken(seconds)
    }

    const handleSubmit = () => {
        const randomSuccess = Math.random() > 0.5
        setIsSuccess(randomSuccess)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {problem.title}
                            </h1>
                            <TierBadge tier={problem.tier} />
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            {problem.category}
                        </p>

                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700">
                                {problem.content}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            입출력 예시
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    입력 예시
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 font-mono text-sm text-gray-800">
                                    {problem.inputExample}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    출력 예시
                                </p>
                                <div className="bg-green-50 border border-green-200 rounded p-3 font-mono text-sm text-gray-800">
                                    {problem.outputExample}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Timer onTimeUpdate={handleTimeUpdate} />

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            코드 작성
                        </h3>
                        <div className="mb-4">
                            <label
                                htmlFor="language"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                언어 선택
                            </label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="javascript">JavaScript</option>
                                <option value="kotlin">Kotlin</option>
                                <option value="swift">Swift</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="code"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                코드
                            </label>
                            <textarea
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="코드를 입력하세요..."
                                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                            />
                        </div>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={!code.trim()}
                        >
                            제출하기
                        </Button>
                    </div>
                </div>
            </div>

            <ResultModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isSuccess={isSuccess}
                timeTaken={timeTaken}
            />
        </DashboardLayout>
    )
}

