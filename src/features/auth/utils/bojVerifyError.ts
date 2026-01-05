import { isApiError } from '../../../types/api/common.types';

type BojVerifyErrorCode =
    | 'COMMON_RESOURCE_NOT_FOUND'
    | 'COMMON_INVALID_INPUT'
    | 'STUDENT_NOT_FOUND'
    | 'UNKNOWN';

export type BojVerifyGuideKey =
    | 'BOJ_PROFILE_NOT_FOUND'
    | 'BOJ_PROFILE_ACCESS_DENIED'
    | 'BOJ_STATUS_MESSAGE_NOT_FOUND'
    | 'BOJ_CODE_MISMATCH'
    | 'STUDENT_NOT_FOUND'
    | 'UNKNOWN';

export interface BojVerifyErrorGuide {
    title: string;
    description: string;
    steps: readonly string[];
    links?: Array<{ text: string; url: string }>;
}

export interface BojVerifyErrorViewModel {
    message: string;
    guideKey: BojVerifyGuideKey;
    guide?: BojVerifyErrorGuide;
}

const contains = (text: string, keyword: string): boolean => text.includes(keyword);

const toErrorCode = (error: unknown): BojVerifyErrorCode => {
    if (!isApiError(error)) {
        return 'UNKNOWN';
    }
    const code = error.response?.data?.code;
    if (code === 'COMMON_RESOURCE_NOT_FOUND') {
        return 'COMMON_RESOURCE_NOT_FOUND';
    }
    if (code === 'COMMON_INVALID_INPUT') {
        return 'COMMON_INVALID_INPUT';
    }
    if (code === 'STUDENT_NOT_FOUND') {
        return 'STUDENT_NOT_FOUND';
    }
    return 'UNKNOWN';
};

const buildGuide = (guideKey: BojVerifyGuideKey, bojId?: string): BojVerifyErrorGuide | undefined => {
    if (guideKey === 'BOJ_PROFILE_NOT_FOUND') {
        return {
            title: '백준 프로필을 찾을 수 없습니다',
            description: '입력하신 BOJ ID가 존재하지 않거나 올바르지 않습니다.',
            steps: [
                'BOJ ID에 오타가 없는지 확인해주세요.',
                '백준 웹사이트에서 해당 아이디로 로그인할 수 있는지 확인해주세요.',
                '올바른 BOJ ID를 입력한 뒤 다시 시도해주세요.',
            ],
            links: bojId
                ? [
                      {
                          text: '백준 온라인 저지 홈페이지',
                          url: 'https://www.acmicpc.net',
                      },
                      {
                          text: `프로필 확인 (${bojId})`,
                          url: `https://www.acmicpc.net/user/${bojId}`,
                      },
                  ]
                : [
                      {
                          text: '백준 온라인 저지 홈페이지',
                          url: 'https://www.acmicpc.net',
                      },
                  ],
        };
    }
    if (guideKey === 'BOJ_PROFILE_ACCESS_DENIED') {
        return {
            title: '백준 프로필에 접근할 수 없습니다',
            description: '프로필이 비공개이거나 접근이 제한되어 있을 수 있습니다.',
            steps: [
                '백준 프로필 설정에서 프로필 공개 여부를 확인해주세요.',
                '프로필이 공개되어 있는지 확인한 후 다시 시도해주세요.',
            ],
            links: bojId
                ? [
                      {
                          text: '백준 프로필 수정 페이지',
                          url: 'https://www.acmicpc.net/modify',
                      },
                      {
                          text: `프로필 확인 (${bojId})`,
                          url: `https://www.acmicpc.net/user/${bojId}`,
                      },
                  ]
                : [
                      {
                          text: '백준 프로필 수정 페이지',
                          url: 'https://www.acmicpc.net/modify',
                      },
                  ],
        };
    }
    if (guideKey === 'BOJ_STATUS_MESSAGE_NOT_FOUND') {
        return {
            title: '프로필 상태 메시지를 찾을 수 없습니다',
            description: '프로필 상태 메시지가 비어있거나, 저장이 반영되지 않았을 수 있습니다.',
            steps: [
                '1단계: 위에서 발급된 인증 코드를 복사하세요.',
                '2단계: 백준 프로필 수정 페이지로 이동하세요.',
                '3단계: "상태 메시지" 필드에 인증 코드를 붙여넣고 저장하세요.',
                '4단계: 저장 후 몇 초 대기한 뒤 "인증 확인" 버튼을 다시 클릭하세요.',
            ],
            links: [
                {
                    text: '백준 프로필 수정 페이지',
                    url: 'https://www.acmicpc.net/modify',
                },
            ],
        };
    }
    if (guideKey === 'BOJ_CODE_MISMATCH') {
        return {
            title: '인증 코드를 찾을 수 없습니다',
            description: '프로필 상태 메시지에 발급된 코드가 정확히 포함되어야 합니다.',
            steps: [
                '1단계: 위에서 발급된 인증 코드를 다시 복사하세요. (복사 버튼 클릭)',
                '2단계: 백준 프로필 수정 페이지로 이동하세요.',
                '3단계: 기존 상태 메시지를 모두 삭제하고, 발급된 코드만 붙여넣으세요.',
                '4단계: 공백이나 오타가 없는지 확인한 뒤 저장하세요.',
                '5단계: 저장 후 몇 초 대기한 뒤 "인증 확인" 버튼을 다시 클릭하세요.',
            ],
            links: [
                {
                    text: '백준 프로필 수정 페이지',
                    url: 'https://www.acmicpc.net/modify',
                },
            ],
        };
    }
    if (guideKey === 'STUDENT_NOT_FOUND') {
        // 이 에러는 더 이상 발생하지 않아야 함 (백엔드에서 DB 조회 제거됨)
        return {
            title: '서버 오류가 발생했습니다',
            description: '예상치 못한 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            steps: [
                '잠시 후 다시 시도해주세요.',
                '문제가 계속되면 페이지를 새로고침하거나 다른 시간에 시도해주세요.',
            ],
        };
    }
    return undefined;
};

const messageFromApi = (error: unknown): string | null => {
    if (!isApiError(error)) {
        return null;
    }
    const message = error.response?.data?.message;
    if (!message) {
        return null;
    }
    return message;
};

const mapCommonInvalidInput = (errorMessage: string | null): BojVerifyGuideKey => {
    if (!errorMessage) {
        return 'UNKNOWN';
    }
    if (contains(errorMessage, '접근할 수 없습니다')) {
        return 'BOJ_PROFILE_ACCESS_DENIED';
    }
    if (contains(errorMessage, '상태 메시지를 찾을 수 없습니다') || contains(errorMessage, '상태 메시지를 찾을 수 없음')) {
        return 'BOJ_STATUS_MESSAGE_NOT_FOUND';
    }
    return 'BOJ_CODE_MISMATCH';
};

export const getBojVerifyErrorViewModel = (error: unknown, bojId?: string): BojVerifyErrorViewModel => {
    const errorCode = toErrorCode(error);
    const apiMessage = messageFromApi(error);

    if (errorCode === 'COMMON_RESOURCE_NOT_FOUND') {
        return {
            message: '백준 프로필을 찾을 수 없습니다. BOJ ID가 올바른지 확인해주세요.',
            guideKey: 'BOJ_PROFILE_NOT_FOUND',
            guide: buildGuide('BOJ_PROFILE_NOT_FOUND', bojId),
        };
    }

    // STUDENT_NOT_FOUND는 더 이상 발생하지 않아야 함 (문서: PR_BOJ_VERIFY_IMPROVEMENT.md)
    // 백엔드에서 DB 조회 로직이 제거되었으므로, 이 에러가 발생하면 백엔드 버그일 수 있음
    if (errorCode === 'STUDENT_NOT_FOUND') {
        return {
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            guideKey: 'STUDENT_NOT_FOUND',
            guide: buildGuide('STUDENT_NOT_FOUND', bojId),
        };
    }

    if (errorCode === 'COMMON_INVALID_INPUT') {
        const guideKey = mapCommonInvalidInput(apiMessage);
        const fallbackMessage =
            guideKey === 'BOJ_PROFILE_ACCESS_DENIED'
                ? '백준 프로필 페이지에 접근할 수 없습니다. 프로필이 공개되어 있는지 확인해주세요.'
                : guideKey === 'BOJ_STATUS_MESSAGE_NOT_FOUND'
                  ? '백준 프로필 상태 메시지를 찾을 수 없습니다. 인증 코드를 입력하고 저장한 뒤 다시 시도해주세요.'
                  : '프로필 상태 메시지에서 인증 코드를 찾을 수 없습니다. 코드를 정확히 입력하고 저장한 뒤 다시 시도해주세요.';

        return {
            message: apiMessage ?? fallbackMessage,
            guideKey,
            guide: buildGuide(guideKey, bojId),
        };
    }

    return {
        message: apiMessage ?? '인증에 실패했습니다. 잠시 후 다시 시도해주세요.',
        guideKey: 'UNKNOWN',
        guide: {
            title: '인증에 실패했습니다',
            description: '예상치 못한 오류가 발생했습니다.',
            steps: [
                '인터넷 연결을 확인해주세요.',
                '잠시 후 다시 시도해주세요.',
                '문제가 계속되면 페이지를 새로고침하거나 다른 시간에 시도해주세요.',
            ],
        },
    };
};


