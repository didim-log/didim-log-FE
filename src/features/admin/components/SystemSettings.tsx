/**
 * 관리자 시스템 설정 (유지보수 모드, 슈퍼 관리자 생성)
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useSetMaintenanceMode } from '../../../hooks/api/useAdmin';
import { authApi } from '../../../api/endpoints/auth.api';
import { validation } from '../../../utils/validation';
import { toast } from 'sonner';
import type { SuperAdminRequest } from '../../../types/api/auth.types';

export const SystemSettings: FC = () => {
    const setMaintenanceMutation = useSetMaintenanceMode();
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // 슈퍼 관리자 생성
    const [isCreatingSuperAdmin, setIsCreatingSuperAdmin] = useState(false);
    const [superAdminBojId, setSuperAdminBojId] = useState('');
    const [superAdminEmail, setSuperAdminEmail] = useState('');
    const [superAdminPassword, setSuperAdminPassword] = useState('');
    const [superAdminKey, setSuperAdminKey] = useState('');
    const [superAdminError, setSuperAdminError] = useState<string | null>(null);

    const toggle = async () => {
        const next = !enabled;

        if (next) {
            const ok = confirm('유지보수 모드를 활성화하면 일반 사용자는 503으로 차단됩니다. 계속할까요?');
            if (!ok) {
                return;
            }
        }

        const result = await setMaintenanceMutation.mutateAsync({ enabled: next });
        setEnabled(result.enabled);
        setMessage(result.message);
    };

    const handleCreateSuperAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuperAdminError(null);

        // 유효성 검사
        const bojIdValidation = validation.isValidBojId(superAdminBojId.trim());
        if (!bojIdValidation.valid) {
            setSuperAdminError(bojIdValidation.message || '올바른 BOJ ID 형식이 아닙니다.');
            return;
        }

        if (!validation.isValidEmail(superAdminEmail.trim())) {
            setSuperAdminError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        const passwordValidation = validation.isValidPassword(superAdminPassword);
        if (!passwordValidation.valid) {
            setSuperAdminError(passwordValidation.message || '비밀번호 형식이 올바르지 않습니다.');
            return;
        }

        if (!superAdminKey.trim()) {
            setSuperAdminError('관리자 키를 입력해주세요.');
            return;
        }

        try {
            const request: SuperAdminRequest = {
                bojId: superAdminBojId.trim(),
                email: superAdminEmail.trim(),
                password: superAdminPassword,
                adminKey: superAdminKey.trim(),
            };
            await authApi.createSuperAdmin(request);
            toast.success('슈퍼 관리자 계정이 생성되었습니다.');
            // 성공 시 폼 초기화
            setSuperAdminBojId('');
            setSuperAdminEmail('');
            setSuperAdminPassword('');
            setSuperAdminKey('');
            setIsCreatingSuperAdmin(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || '슈퍼 관리자 생성에 실패했습니다.';
            setSuperAdminError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">시스템 설정</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    유지보수 모드를 토글합니다. (일반 사용자는 접근 차단)
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">유지보수 모드</p>
                        <p className={`mt-2 text-xl font-bold ${enabled ? 'text-red-600' : 'text-green-600'}`}>
                            {enabled ? 'ON' : 'OFF'}
                        </p>
                        {message && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={toggle}
                        variant={enabled ? 'danger' : 'primary'}
                        isLoading={setMaintenanceMutation.isPending}
                    >
                        {enabled ? '비활성화' : '활성화'}
                    </Button>
                </div>
            </div>

            {/* 슈퍼 관리자 생성 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">슈퍼 관리자 생성</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            초기 관리자 계정을 생성합니다. (한 번만 사용)
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreatingSuperAdmin(!isCreatingSuperAdmin)}
                        variant="outline"
                        size="sm"
                    >
                        {isCreatingSuperAdmin ? '접기' : '열기'}
                    </Button>
                </div>

                {isCreatingSuperAdmin && (
                    <form onSubmit={handleCreateSuperAdmin} className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <Input
                            label="BOJ ID"
                            type="text"
                            value={superAdminBojId}
                            onChange={(e) => {
                                setSuperAdminBojId(e.target.value);
                                setSuperAdminError(null);
                            }}
                            placeholder="BOJ ID를 입력하세요"
                            required
                        />
                        <Input
                            label="이메일"
                            type="email"
                            value={superAdminEmail}
                            onChange={(e) => {
                                setSuperAdminEmail(e.target.value);
                                setSuperAdminError(null);
                            }}
                            placeholder="이메일을 입력하세요"
                            required
                        />
                        <Input
                            label="비밀번호"
                            type="password"
                            value={superAdminPassword}
                            onChange={(e) => {
                                setSuperAdminPassword(e.target.value);
                                setSuperAdminError(null);
                            }}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                        <Input
                            label="관리자 키"
                            type="password"
                            value={superAdminKey}
                            onChange={(e) => {
                                setSuperAdminKey(e.target.value);
                                setSuperAdminError(null);
                            }}
                            placeholder="관리자 키를 입력하세요"
                            required
                        />
                        {superAdminError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{superAdminError}</p>
                        )}
                        <Button type="submit" variant="primary" className="w-full sm:w-auto">
                            슈퍼 관리자 생성
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};


