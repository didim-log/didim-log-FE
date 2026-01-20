/**
 * 템플릿 미리보기용 Smart Mock 데이터 생성 유틸리티
 * 문제 1000번(A+B)을 풀었다고 가정한 예시 답변을 생성합니다.
 */

/**
 * 섹션 제목에 따른 Smart Mock 본문 생성
 * @param title - 섹션 제목
 * @returns 문제 1000번(A+B) 기준의 예시 답변
 */
export function getSmartMockBody(title: string): string {
    const lowerTitle = title.toLowerCase();

    // 핵심 로직, 접근, 풀이
    if (lowerTitle.includes('핵심') || lowerTitle.includes('로직') || lowerTitle.includes('접근') || lowerTitle.includes('풀이')) {
        return 'Scanner를 사용하여 두 정수를 입력받고, `+` 연산자로 합을 구하여 출력했습니다.';
    }

    // 복잡도, 시간 복잡도, 공간 복잡도
    if (lowerTitle.includes('복잡도') || lowerTitle.includes('시간 복잡도') || lowerTitle.includes('공간 복잡도')) {
        return '- 시간 복잡도: O(1)\n- 공간 복잡도: O(1)\n(단순 연산이므로 입력 크기에 영향을 받지 않습니다.)';
    }

    // 실패 원인, 원인, 버그
    if (lowerTitle.includes('실패 원인') || lowerTitle.includes('원인') || lowerTitle.includes('버그')) {
        return '예제 입력은 통과했으나, 음수 입력에 대한 예외 처리를 하지 않아 런타임 에러가 발생했습니다.';
    }

    // 해결 방안, 개선, 리팩토링
    if (lowerTitle.includes('해결') || lowerTitle.includes('방안') || lowerTitle.includes('개선') || lowerTitle.includes('리팩토링')) {
        return 'Long 타입으로 변경하여 자료형 범위 초과 문제를 해결했습니다.';
    }

    // 부족했던 개념, 배움, 개념
    if (lowerTitle.includes('부족') || lowerTitle.includes('개념') || lowerTitle.includes('배움')) {
        return '표준 입출력 방식과 형변환(Type Casting)에 대해 다시 복습했습니다.';
    }

    // 디버깅 과정
    if (lowerTitle.includes('디버깅') || lowerTitle.includes('디버깅 과정')) {
        return '예제 입력(1, 2)은 통과했으나, 큰 수 입력(10^9, 10^9)에서 오버플로우가 발생하는 것을 발견했습니다.';
    }

    // 반례
    if (lowerTitle.includes('반례')) {
        return '입력값이 정수 범위를 초과하는 경우(Integer.MAX_VALUE + Integer.MAX_VALUE)가 반례였습니다.';
    }

    // 다음 시도 계획
    if (lowerTitle.includes('다음') || lowerTitle.includes('계획') || lowerTitle.includes('시도')) {
        return '1. 자료형 범위 확인\n2. 예외 처리 추가\n3. 엣지 케이스 테스트';
    }

    // 문제 요약
    if (lowerTitle.includes('문제') && lowerTitle.includes('요약')) {
        return '두 정수 A와 B를 입력받아 A+B를 출력하는 기본적인 입출력 문제입니다.';
    }

    // 참고 자료
    if (lowerTitle.includes('참고') || lowerTitle.includes('자료')) {
        return '- 백준 온라인 저지: https://www.acmicpc.net/problem/1000\n- Java Scanner API 문서';
    }

    // 오늘의 한마디
    if (lowerTitle.includes('한마디') || lowerTitle.includes('느낀점')) {
        return '간단한 문제라도 자료형 범위를 항상 확인해야 한다는 것을 배웠습니다.';
    }

    // 리팩토링 포인트
    if (lowerTitle.includes('리팩토링 포인트') || lowerTitle.includes('리팩토링')) {
        return 'BufferedReader와 StringTokenizer를 사용하면 입력 속도를 더 개선할 수 있습니다.';
    }

    // 다른 풀이 비교
    if (lowerTitle.includes('다른') || lowerTitle.includes('비교') || lowerTitle.includes('풀이 비교')) {
        return '다른 접근 방법으로는 문자열로 입력받아 파싱하는 방법도 있지만, 이 문제에서는 Scanner가 더 간단합니다.';
    }

    // 사용한 자료구조
    if (lowerTitle.includes('자료구조') || lowerTitle.includes('사용한')) {
        return '이 문제에서는 별도의 자료구조가 필요 없지만, 기본 입출력 클래스(Scanner)를 사용했습니다.';
    }

    // 기본값
    return '여기에 해당 섹션에 대한 내용을 자유롭게 작성하게 됩니다.';
}
