interface TestCase {
    input: string
    expectedOutput: string
}

const problemTestCases: Record<string, TestCase[]> = {
    '1000': [
        {
            input: '1 2',
            expectedOutput: '3',
        },
        {
            input: '5 3',
            expectedOutput: '8',
        },
    ],
}

export function runCode(
    code: string,
    language: string,
    problemId: string
): { success: boolean; message: string } {
    const testCases = problemTestCases[problemId]
    if (!testCases || testCases.length === 0) {
        return {
            success: false,
            message: '테스트 케이스를 찾을 수 없습니다.',
        }
    }

    try {
        for (const testCase of testCases) {
            const result = executeCode(code, language, testCase.input)
            if (result.trim() !== testCase.expectedOutput.trim()) {
                return {
                    success: false,
                    message: `테스트 실패: 입력 "${testCase.input}"에 대해 예상 출력 "${testCase.expectedOutput}"이지만 실제 출력은 "${result}"입니다.`,
                }
            }
        }
        return {
            success: true,
            message: '모든 테스트 케이스를 통과했습니다!',
        }
    } catch (error) {
        return {
            success: false,
            message: `코드 실행 중 오류가 발생했습니다: ${error}`,
        }
    }
}

function executeCode(code: string, language: string, input: string): string {
    if (language === 'python') {
        return executePython(code, input)
    }
    if (language === 'java') {
        return executeJava(code, input)
    }
    if (language === 'kotlin') {
        return executeKotlin(code, input)
    }
    if (language === 'cpp') {
        return executeCpp(code, input)
    }
    if (language === 'javascript') {
        return executeJavaScript(code, input)
    }
    if (language === 'swift') {
        return executeSwift(code, input)
    }

    throw new Error(`지원하지 않는 언어입니다: ${language}`)
}

function executePython(code: string, input: string): string {
    try {
        const inputLines = input.trim().split(/\s+/)
        let output = ''

        const inputValues = inputLines.map(Number)
        const a = inputValues[0]
        const b = inputValues[1]

        const func = new Function('a', 'b', `
            ${code}
            return a + b
        `)

        const result = func(a, b)
        output = String(result)

        return output.trim()
    } catch (error) {
        throw new Error(`Python 실행 오류: ${error}`)
    }
}

function executeJavaScript(code: string, input: string): string {
    try {
        const inputLines = input.trim().split(/\s+/)
        const inputValues = inputLines.map(Number)
        const a = inputValues[0]
        const b = inputValues[1]

        let output = ''

        const func = new Function('a', 'b', `
            ${code}
            return a + b
        `)

        const result = func(a, b)
        output = String(result)

        return output.trim()
    } catch (error) {
        throw new Error(`JavaScript 실행 오류: ${error}`)
    }
}

function executeJava(code: string, input: string): string {
    void code
    void input
    return 'Java 실행은 서버에서 처리해야 합니다.'
}

function executeKotlin(code: string, input: string): string {
    void code
    void input
    return 'Kotlin 실행은 서버에서 처리해야 합니다.'
}

function executeCpp(code: string, input: string): string {
    void code
    void input
    return 'C++ 실행은 서버에서 처리해야 합니다.'
}

function executeSwift(code: string, input: string): string {
    void code
    void input
    return 'Swift 실행은 서버에서 처리해야 합니다.'
}
