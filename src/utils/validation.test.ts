import { describe, expect, it } from 'vitest';
import { validation } from './validation';

describe('validation.isValidPassword', () => {
    it('마침표/언더스코어/하이픈도 특수문자로 인식하여 통과한다', () => {
        const dot = validation.isValidPassword('Abcdef1.');
        expect(dot.valid).toBe(true);

        const underscore = validation.isValidPassword('Abcdef1_');
        expect(underscore.valid).toBe(true);

        const hyphen = validation.isValidPassword('Abcdef1-');
        expect(hyphen.valid).toBe(true);
    });
});

describe('validation.getPasswordPolicyDetails', () => {
    it('특수문자 정책 hasSpecial이 마침표/언더스코어/하이픈에서 true가 된다', () => {
        expect(validation.getPasswordPolicyDetails('Abcdef1.').hasSpecial).toBe(true);
        expect(validation.getPasswordPolicyDetails('Abcdef1_').hasSpecial).toBe(true);
        expect(validation.getPasswordPolicyDetails('Abcdef1-').hasSpecial).toBe(true);
    });
});



