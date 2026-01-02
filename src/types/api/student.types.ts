/**
 * 학생 프로필 관련 API 타입 정의
 */

export type PrimaryLanguage = 'C' | 'CPP' | 'CSHARP' | 'GO' | 'JAVA' | 'JAVASCRIPT' | 'KOTLIN' | 'PYTHON' | 'R' | 'RUBY' | 'SCALA' | 'SWIFT' | 'TEXT';

export interface UpdateProfileRequest {
    nickname?: string | null;
    currentPassword?: string | null;
    newPassword?: string | null;
    primaryLanguage?: PrimaryLanguage | null;
}


