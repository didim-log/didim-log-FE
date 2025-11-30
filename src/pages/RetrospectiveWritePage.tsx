import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import { ArrowLeft, Copy, Save } from 'lucide-react'
import Button from '../components/common/Button'
import { Tier } from '../types/tier'

interface Problem {
    id: string
    title: string
    tier: Tier
    category: string
}

const mockProblem: Problem = {
    id: '1000',
    title: 'A+B',
    tier: Tier.BRONZE,
    category: 'IMPLEMENTATION',
}

function generateTemplate(problemTitle: string): string {
    return `# ${problemTitle} 회고

## 💡 접근 방법

- (문제를 어떻게 분석하고 접근했는지 적어주세요)

## 📝 코드 설계

- 시간복잡도: $O(n)$
- 공간복잡도: $O(1)$
- 사용 알고리즘: (예: 그리디, DFS, BFS 등)

## 💻 코드

\`\`\`python
def solution():
    # 코드를 여기에 작성하세요
    pass
\`\`\`

## 🚀 배운 점

- (이번 문제를 통해 배운 점을 적어주세요)

## 📚 참고 자료

- (참고한 자료나 링크가 있다면 적어주세요)
`
}

export default function RetrospectiveWritePage() {
    const { problemId } = useParams<{ problemId: string }>()
    const navigate = useNavigate()
    const [content, setContent] = useState('')
    const problem = mockProblem

    useEffect(() => {
        if (!content.trim()) {
            setContent(generateTemplate(problem.title))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleBack = () => {
        navigate(`/problems/${problemId}`)
    }

    const handleExportMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(content)
            window.alert(
                '마크다운 내용이 복사되었습니다! 원하시는 곳에 붙여넣으세요.'
            )
        } catch (error) {
            window.alert('복사에 실패했습니다. 다시 시도해주세요.')
        }
    }

    const handleSave = () => {
        if (!content.trim()) {
            alert('내용을 입력해주세요.')
            return
        }
        alert('작성한 회고가 저장되었습니다.')
        navigate('/dashboard')
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">
                        {problem.title} 회고 작성
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExportMarkdown}
                        className="flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Markdown 내보내기
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        저장하기
                    </Button>
                </div>
            </header>

            <div
                className="flex-1 overflow-hidden w-full"
                style={{ height: 'calc(100vh - 80px)' }}
            >
                <div className="w-full h-full">
                    <MDEditor
                        value={content}
                        onChange={(value) => setContent(value || '')}
                        previewOptions={{
                            rehypePlugins: [[rehypeSanitize]],
                        }}
                        data-color-mode="light"
                        preview="live"
                    />
                </div>
            </div>
        </div>
    )
}

