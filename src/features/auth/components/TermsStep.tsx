/**
 * 약관 동의 단계 컴포넌트
 */

import { useState } from 'react';
import { Button } from '../../../components/ui/Button';

interface TermsStepProps {
    onNext: (agreed: boolean) => void;
}

export const TermsStep: React.FC<TermsStepProps> = ({ onNext }) => {
    const [isAgreed, setIsAgreed] = useState(false);

    const handleNext = () => {
        if (!isAgreed) {
            alert('약관에 동의해주세요.');
            return;
        }
        onNext(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">약관 동의</h2>
                <p className="text-gray-600">서비스 이용을 위해 약관에 동의해주세요.</p>
            </div>

            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">서비스 이용약관</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                    {`제1조 (목적)
이 약관은 디딤로그(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 알고리즘 문제 풀이 및 회고 작성 플랫폼을 의미합니다.
2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.

제4조 (회원가입)
1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
2. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
   - 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
   - 등록 내용에 허위, 기재누락, 오기가 있는 경우
   - 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우

제5조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 서비스를 제공합니다.
   - 알고리즘 문제 추천 및 조회
   - 문제 풀이 기록 관리
   - 회고 작성 및 관리
   - 통계 및 랭킹 서비스

제6조 (개인정보보호)
1. 회사는 이용자의 개인정보 수집 시 필요한 최소한의 정보를 수집합니다.
2. 회사는 이용자의 개인정보를 보호하기 위하여 노력합니다.`}
                </p>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="terms-agree"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms-agree" className="ml-2 text-sm text-gray-700">
                    약관에 동의합니다 (필수)
                </label>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleNext} variant="primary" disabled={!isAgreed}>
                    다음
                </Button>
            </div>
        </div>
    );
};

