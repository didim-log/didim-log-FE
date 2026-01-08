import { memberApi } from '../../api/endpoints/member.api';

export const resetAndStartTour = async (): Promise<void> => {
    try {
        await memberApi.resetOnboarding();
        localStorage.removeItem('didim_onboarding_completed');
        window.location.reload();
    } catch {
        // 온보딩 리셋 API 실패 시에도 로컬 상태 초기화 후 새로고침
        localStorage.removeItem('didim_onboarding_completed');
        window.location.reload();
    }
};
