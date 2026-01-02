/**
 * 3단계 회원가입 위저드 컴포넌트
 */

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Check } from 'lucide-react';
import { TermsStep } from './TermsStep';
import { BojVerifyStep } from './BojVerifyStep';
import { SignupFormStep } from './SignupFormStep';

type Step = 1 | 2 | 3;

interface SignupWizardProps {
    onComplete: (data: { bojId: string; email: string; password: string }) => void;
    apiError?: {
        message: string;
        code?: string;
        status?: number;
        fieldErrors?: Record<string, string[]>;
    } | null;
}

export const SignupWizard: FC<SignupWizardProps> = ({ onComplete, apiError }) => {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [bojId, setBojId] = useState('');
    const [duplicateBojIdError, setDuplicateBojIdError] = useState<string | null>(null);

    const handleStep1Complete = () => {
        setCurrentStep(2);
    };

    const handleStep2Complete = (verifiedBojId: string) => {
        setBojId(verifiedBojId);
        setDuplicateBojIdError(null); // 2단계로 돌아왔을 때 에러 초기화
        setCurrentStep(3);
    };

    const handleStep3Complete = (data: { email: string; password: string }) => {
        onComplete({ bojId, ...data });
    };

    // DUPLICATE_BOJ_ID 에러가 발생하면 2단계로 돌아가기 (안전장치 - 2단계에서 이미 체크하지만 혹시 모를 경우 대비)
    useEffect(() => {
        if (apiError?.code === 'DUPLICATE_BOJ_ID' && currentStep === 3) {
            setCurrentStep(2);
            setDuplicateBojIdError('이미 가입된 백준 아이디입니다. 다른 BOJ ID를 사용해주세요.');
            setBojId('');
        }
    }, [apiError?.code, currentStep]); // apiError 전체가 아닌 code만 의존성으로

    return (
        <div className="w-full mx-auto">
            {/* 진행 단계 표시 */}
            <div className="mb-10">
                <div className="relative flex justify-between items-center w-full max-w-lg mx-auto">
                    {/* 1. 회색 배경 선 (전체 너비, 정중앙 관통) */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
                    
                    {/* 2. 인디고 진행 선 (현재 단계까지만, 정중앙 관통) */}
                    {currentStep > 1 && (
                        <div 
                            className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        />
                    )}

                    {/* 3. 단계 원(Circle) 및 라벨 */}
                    {[
                        { step: 1, label: '약관 동의' },
                        { step: 2, label: 'BOJ 인증' },
                        { step: 3, label: '정보 입력' },
                    ].map(({ step, label }) => (
                        <div key={step} className="relative z-10 flex flex-col items-center bg-transparent">
                            {/* 원 뒤에 흰색 배경을 줘서 선이 투과되지 않게 함 */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                currentStep > step 
                                    ? 'border-indigo-500 bg-indigo-500' // 완료
                                    : currentStep === step 
                                    ? 'border-indigo-500 bg-white' // 현재
                                    : 'border-gray-300 bg-white text-gray-400' // 예정
                            }`}>
                                {/* 완료되면 체크 아이콘, 아니면 숫자 */}
                                {currentStep > step ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : (
                                    <span className={`text-sm font-bold ${
                                        currentStep === step ? 'text-indigo-500' : 'text-gray-400'
                                    }`}>{step}</span>
                                )}
                            </div>
                            {/* 라벨 */}
                            <span className={`absolute top-12 whitespace-nowrap text-xs font-medium ${
                                currentStep >= step ? 'text-indigo-600' : 'text-gray-500'
                            }`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 단계별 컴포넌트 */}
            {currentStep === 1 && <TermsStep onNext={handleStep1Complete} />}
            {currentStep === 2 && (
                <BojVerifyStep
                    onNext={handleStep2Complete}
                    onBack={() => setCurrentStep(1)}
                    duplicateError={duplicateBojIdError}
                    onErrorClear={() => setDuplicateBojIdError(null)}
                />
            )}
            {currentStep === 3 && (
                <SignupFormStep
                    bojId={bojId}
                    onComplete={handleStep3Complete}
                    onBack={() => setCurrentStep(2)}
                    apiError={apiError}
                />
            )}
        </div>
    );
};

