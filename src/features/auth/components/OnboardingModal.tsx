/**
 * 신규 유저 온보딩 모달
 */

import type { FC } from 'react';
import { Button } from '../../../components/ui/Button';
import { useOnboardingStore } from '../../../stores/onboarding.store';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OnboardingModal: FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const { completeOnboarding } = useOnboardingStore();

    if (!isOpen) {
        return null;
    }

    const handleComplete = () => {
        completeOnboarding();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">디딤로그에 오신 것을 환영합니다! 🎉</h2>

                <div className="space-y-4 mb-6">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">📚 문제 풀이</h3>
                        <p className="text-gray-600">
                            백준 온라인 저지 문제를 추천받고, 직접 풀어보며 실력을 향상시킬 수 있습니다.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">✍️ 회고 작성</h3>
                        <p className="text-gray-600">
                            문제를 풀고 나서 회고를 작성하면, AI가 분석하여 학습 키워드를 추천해드립니다.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">📊 통계 및 랭킹</h3>
                        <p className="text-gray-600">
                            내 풀이 활동을 시각화하고, 다른 사용자들과 랭킹을 비교할 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleComplete} variant="primary">
                        시작하기
                    </Button>
                </div>
            </div>
        </div>
    );
};


