/**
 * 유효성 검사 함수
 */

// 비밀번호에서 "특수문자"는 영문/숫자/공백이 아닌 모든 문자로 판단합니다.
// - 예: ., _, -, @ 등 일반적인 키보드 특수문자 포함
const PASSWORD_SPECIAL_CHAR_REGEX = /[^A-Za-z0-9\s]/;

export const validation = {
    /**
     * 이메일 유효성 검사
     */
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * 비밀번호 유효성 검사
     * - 영문, 숫자, 특수문자 중 3종류 이상 조합: 최소 8자리 이상
     * - 영문, 숫자, 특수문자 중 2종류 이상 조합: 최소 10자리 이상
     * - 공백 포함 불가
     */
    isValidPassword: (password: string): { valid: boolean; message?: string } => {
        if (password.includes(' ')) {
            return { valid: false, message: '비밀번호에 공백을 포함할 수 없습니다.' };
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = PASSWORD_SPECIAL_CHAR_REGEX.test(password);

        const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

        if (typeCount === 1) {
            return { valid: false, message: '영문, 숫자, 특수문자 중 최소 2종류 이상을 조합해야 합니다.' };
        }

        if (typeCount === 2 && password.length < 10) {
            return { valid: false, message: '영문, 숫자, 특수문자 중 2종류 이상 조합 시 최소 10자리 이상이어야 합니다.' };
        }

        if (typeCount >= 3 && password.length < 8) {
            return { valid: false, message: '영문, 숫자, 특수문자 3종류 이상 조합 시 최소 8자리 이상이어야 합니다.' };
        }

        return { valid: true };
    },

    /**
     * 비밀번호 정책 상세 정보 (실시간 피드백용)
     */
    getPasswordPolicyDetails: (password: string): {
        hasLetter: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
        hasNoSpace: boolean;
        typeCount: number;
        minLength: number;
        currentLength: number;
        isValid: boolean;
    } => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = PASSWORD_SPECIAL_CHAR_REGEX.test(password);
        const hasNoSpace = !password.includes(' ');
        const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
        
        // 최소 길이 결정
        let minLength = 0;
        if (typeCount >= 3) {
            minLength = 8;
        } else if (typeCount >= 2) {
            minLength = 10;
        } else {
            minLength = 10; // 기본값 (2종류 이상 필요)
        }

        const isValid = hasNoSpace && typeCount >= 2 && password.length >= minLength;

        return {
            hasLetter,
            hasNumber,
            hasSpecial,
            hasNoSpace,
            typeCount,
            minLength,
            currentLength: password.length,
            isValid,
        };
    },

    /**
     * BOJ ID 유효성 검사
     * 백엔드: ^[a-zA-Z0-9_]+$ (영문, 숫자, 언더스코어만 허용)
     */
    isValidBojId: (bojId: string): { valid: boolean; message?: string } => {
        if (!bojId.trim()) {
            return { valid: false, message: 'BOJ ID를 입력해주세요.' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(bojId)) {
            return { valid: false, message: '영문, 숫자, 언더스코어(_)만 사용 가능합니다.' };
        }
        return { valid: true };
    },

    /**
     * 닉네임 유효성 검사
     * - 한글 완성형, 영문, 숫자만 허용
     * - 특수문자, 공백, 초성/모음 단독 불가
     * - 길이: 2자 이상 20자 이하
     */
    isValidNickname: (nickname: string): { valid: boolean; message?: string } => {
        if (nickname.length < 2 || nickname.length > 20) {
            return { valid: false, message: '닉네임은 2자 이상 20자 이하여야 합니다.' };
        }

        // 한글 완성형(가-힣), 영문(a-zA-Z), 숫자(0-9)만 허용
        // 공백, 특수문자, 초성/모음 단독은 불가
        const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
        if (!nicknameRegex.test(nickname)) {
            return { valid: false, message: '닉네임은 한글, 영문, 숫자만 사용 가능합니다. 특수문자와 공백은 사용할 수 없습니다.' };
        }

        return { valid: true };
    },
};
