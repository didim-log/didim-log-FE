import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Timer from '../components/problem/Timer'
import ResultModal from '../components/problem/ResultModal'
import TierBadge from '../components/dashboard/TierBadge'
import Button from '../components/common/Button'
import { Tier } from '../types/tier'
import { runCode } from '../utils/codeRunner'

interface Problem {
    id: string
    title: string
    tier: Tier
    category: string
    content: string
    timeLimit: number
    inputExample: string[]
    outputExample: string[]
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
    timeLimit: 2,
    inputExample: ['1 2'],
    outputExample: ['3'],
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
        if (!code.trim()) {
            return
        }

        const result = runCode(code, language, problem.id)
        setIsSuccess(result.success)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    return (
        <DashboardLayout fullHeight>
            <div className="h-full flex flex-col">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col flex-1 min-h-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                                        {problem.title}
                                    </h1>
                                    <TierBadge tier={problem.tier} />
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    제한 시간: <span className="font-semibold">{problem.timeLimit}초</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {problem.category}
                            </p>

                            <div className="flex-1 overflow-y-auto mb-6">
                                <div className="prose max-w-none dark:prose-invert">
                                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                        {problem.content}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                    입출력 예시
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    입력
                                                </th>
                                                <th className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    출력
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {problem.inputExample.map((input, index) => (
                                                <tr key={index}>
                                                    <td className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">
                                                        {input}
                                                    </td>
                                                    <td className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">
                                                        {problem.outputExample[index] || ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full overflow-hidden space-y-6">
                        <div className="flex-shrink-0">
                            <Timer
                                onTimeUpdate={handleTimeUpdate}
                                shouldPause={isModalOpen && isSuccess}
                            />
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col flex-1 min-h-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                코드 작성
                            </h3>
                            <div className="mb-4">
                                <label
                                    htmlFor="language"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    언어 선택
                                </label>
                                <select
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="kotlin">Kotlin</option>
                                    <option value="cpp">C++</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="swift">Swift</option>
                                </select>
                            </div>
                            <div className="flex-1 mb-4 min-h-0">
                                <label
                                    htmlFor="code"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    코드
                                </label>
                                <textarea
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="코드를 입력하세요..."
                                    className="w-full h-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                            <div className="flex-shrink-0">
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
                </div>
            </div>

            <ResultModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isSuccess={isSuccess}
                timeTaken={timeTaken}
                problemId={problem.id}
            />
        </DashboardLayout>
    )
}

