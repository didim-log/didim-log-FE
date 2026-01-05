import { describe, expect, it } from 'vitest';
import { getBojVerifyErrorViewModel } from './bojVerifyError';

describe('getBojVerifyErrorViewModel', () => {
    it('COMMON_RESOURCE_NOT_FOUND는 BOJ_PROFILE_NOT_FOUND 가이드로 매핑한다', () => {
        const error = {
            response: {
                status: 404,
                data: {
                    status: 404,
                    error: 'Not Found',
                    code: 'COMMON_RESOURCE_NOT_FOUND',
                    message: '백준 프로필을 찾을 수 없습니다.',
                },
            },
        };

        const result = getBojVerifyErrorViewModel(error);

        expect(result.guideKey).toBe('BOJ_PROFILE_NOT_FOUND');
        expect(result.guide).toBeDefined();
    });

    it('STUDENT_NOT_FOUND는 STUDENT_NOT_FOUND 가이드로 매핑한다', () => {
        const error = {
            response: {
                status: 404,
                data: {
                    status: 404,
                    error: 'Not Found',
                    code: 'STUDENT_NOT_FOUND',
                    message: '사용자를 찾을 수 없습니다. bojId=test',
                },
            },
        };

        const result = getBojVerifyErrorViewModel(error);

        expect(result.guideKey).toBe('STUDENT_NOT_FOUND');
        expect(result.message).toContain('서버 오류');
        expect(result.guide).toBeDefined();
        expect(result.guide?.title).toContain('서버 오류');
    });

    it('COMMON_INVALID_INPUT + "접근할 수 없습니다"는 BOJ_PROFILE_ACCESS_DENIED로 매핑한다', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    status: 400,
                    error: 'Bad Request',
                    code: 'COMMON_INVALID_INPUT',
                    message: '백준 프로필 페이지에 접근할 수 없습니다. 프로필이 공개되어 있는지 확인해주세요.',
                },
            },
        };

        const result = getBojVerifyErrorViewModel(error);

        expect(result.guideKey).toBe('BOJ_PROFILE_ACCESS_DENIED');
    });

    it('COMMON_INVALID_INPUT + "상태 메시지"는 BOJ_STATUS_MESSAGE_NOT_FOUND로 매핑한다', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    status: 400,
                    error: 'Bad Request',
                    code: 'COMMON_INVALID_INPUT',
                    message:
                        '백준 프로필 상태 메시지를 찾을 수 없습니다. 프로필 상태 메시지에 인증 코드를 입력하고 저장한 뒤 다시 시도해주세요.',
                },
            },
        };

        const result = getBojVerifyErrorViewModel(error);

        expect(result.guideKey).toBe('BOJ_STATUS_MESSAGE_NOT_FOUND');
    });

    it('COMMON_INVALID_INPUT의 나머지 케이스는 BOJ_CODE_MISMATCH로 매핑한다', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    status: 400,
                    error: 'Bad Request',
                    code: 'COMMON_INVALID_INPUT',
                    message:
                        '프로필 페이지에서 코드를 찾을 수 없습니다. 프로필 상태 메시지에 인증 코드를 정확히 입력하고 저장한 후 다시 시도해주세요.',
                },
            },
        };

        const result = getBojVerifyErrorViewModel(error);

        expect(result.guideKey).toBe('BOJ_CODE_MISMATCH');
    });
});


