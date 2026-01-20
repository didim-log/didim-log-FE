/**
 * 관리자 시스템 설정 (유지보수 모드, 슈퍼 관리자 생성)
 */

import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useSetMaintenanceMode } from '../../../hooks/api/useAdmin';
import { authApi } from '../../../api/endpoints/auth.api';
import { systemApi } from '../../../api/endpoints/system.api';
import { validation } from '../../../utils/validation';
import { toast } from 'sonner';
import type { SuperAdminRequest } from '../../../types/api/auth.types';
import type { SystemStatusResponse } from '../../../types/api/system.types';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../../types/api/common.types';

export const SystemSettings: FC = () => {
    const setMaintenanceMutation = useSetMaintenanceMode();
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    
    // 점검 설정 모달 상태
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [noticeId, setNoticeId] = useState<string>('');

    // 슈퍼 관리자 생성
    const [isCreatingSuperAdmin, setIsCreatingSuperAdmin] = useState(false);
    const [superAdminBojId, setSuperAdminBojId] = useState('');
    const [superAdminEmail, setSuperAdminEmail] = useState('');
    const [superAdminPassword, setSuperAdminPassword] = useState('');
    const [superAdminKey, setSuperAdminKey] = useState('');
    const [superAdminError, setSuperAdminError] = useState<string | null>(null);

    // 점검 시간 포맷팅 함수
    const formatMaintenanceTime = (startTime: string, endTime: string): string => {
        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        };

        const formatTime = (date: Date): string => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        const start = new Date(startTime);
        const end = new Date(endTime);

        // 같은 날이면 날짜는 한 번만 표시
        if (formatDate(start) === formatDate(end)) {
            return `${formatDate(start)} ${formatTime(start)} ~ ${formatTime(end)}`;
        }
        return `${formatDate(start)} ${formatTime(start)} ~ ${formatDate(end)} ${formatTime(end)}`;
    };

    // 현재 시스템 상태 조회
    useEffect(() => {
        const fetchSystemStatus = async () => {
            try {
                const status = await systemApi.getSystemStatus();
                setSystemStatus(status);
                setEnabled(status.underMaintenance);
            } catch {
                toast.error('시스템 상태를 불러오는데 실패했습니다.');
            } finally {
                setIsLoadingStatus(false);
            }
        };
        fetchSystemStatus();
    }, []);

    // 유지보수 모드 변경 후 상태 갱신
    useEffect(() => {
        if (setMaintenanceMutation.isSuccess) {
            const fetchSystemStatus = async () => {
                try {
                    const status = await systemApi.getSystemStatus();
                    setSystemStatus(status);
                    setEnabled(status.underMaintenance);
                } catch {
                    toast.error('시스템 상태를 불러오는데 실패했습니다.');
                }
            };
            fetchSystemStatus();
        }
    }, [setMaintenanceMutation.isSuccess]);

    const toggle = async () => {
        const next = !enabled;

        if (next) {
            // 점검 모드 활성화 시 모달 표시
            // 현재 유지보수 모드 상태가 있으면 그 값을 사용, 없으면 기본값 설정
            if (systemStatus?.underMaintenance && systemStatus.startTime && systemStatus.endTime) {
                // 기존 설정값 사용
                const formatDateTimeForInput = (dateString: string): string => {
                    const date = new Date(dateString);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                };
                setStartTime(formatDateTimeForInput(systemStatus.startTime));
                setEndTime(formatDateTimeForInput(systemStatus.endTime));
                setNoticeId(systemStatus.noticeId || '');
            } else {
                // 기본값 설정 (현재 시간 + 1시간)
                const now = new Date();
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                
                // ISO 8601 형식으로 변환 (yyyy-MM-ddTHH:mm)
                const formatDateTime = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                };
                
                setStartTime(formatDateTime(now));
                setEndTime(formatDateTime(oneHourLater));
                setNoticeId('');
            }
            setShowMaintenanceModal(true);
            return;
        }

        // 비활성화 시 바로 실행
        const result = await setMaintenanceMutation.mutateAsync({ enabled: next });
        setEnabled(result.enabled);
        setMessage(result.message);
    };

    const handleMaintenanceSubmit = async () => {
        // 유효성 검사
        if (!startTime || !endTime) {
            toast.error('시작 시간과 종료 시간을 모두 입력해주세요.');
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
            toast.error('종료 시간은 시작 시간보다 늦어야 합니다.');
            return;
        }

        // ISO 8601 형식으로 변환 (yyyy-MM-ddTHH:mm:ss)
        const formatToISO = (dateTime: string): string => {
            // yyyy-MM-ddTHH:mm 형식이면 :00 초 추가
            if (dateTime.length === 16) {
                return dateTime + ':00';
            }
            return dateTime;
        };

        try {
            const result = await setMaintenanceMutation.mutateAsync({
                enabled: true,
                startTime: formatToISO(startTime),
                endTime: formatToISO(endTime),
                noticeId: noticeId.trim() || null,
            });
            setEnabled(result.enabled);
            setMessage(result.message);
            setShowMaintenanceModal(false);
            toast.success('유지보수 모드가 활성화되었습니다.');
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const handleCreateSuperAdmin = async (e: FormEvent) => {
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
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
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
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">유지보수 모드</p>
                        <p className={`mt-2 text-xl font-bold ${enabled ? 'text-red-600' : 'text-green-600'}`}>
                            {enabled ? 'ON' : 'OFF'}
                        </p>
                        {message && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        )}
                        {systemStatus?.underMaintenance && systemStatus.startTime && systemStatus.endTime && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                점검 시간: {formatMaintenanceTime(systemStatus.startTime, systemStatus.endTime)}
                            </p>
                        )}
                        {systemStatus?.underMaintenance && systemStatus.noticeId && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                관련 공지: <Link to={`/notices/${systemStatus.noticeId}`} className="text-blue-600 dark:text-blue-400 hover:underline">공지사항 보기</Link>
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={toggle}
                        variant={enabled ? 'danger' : 'primary'}
                        isLoading={setMaintenanceMutation.isPending || isLoadingStatus}
                    >
                        {enabled ? '비활성화' : '활성화'}
                    </Button>
                </div>
            </div>

            {/* 점검 설정 모달 */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 relative">
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setShowMaintenanceModal(false)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            점검 모드 설정
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    시작 시간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    종료 시간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    관련 공지사항 ID (선택)
                                </label>
                                <Input
                                    type="text"
                                    value={noticeId}
                                    onChange={(e) => setNoticeId(e.target.value)}
                                    placeholder="MongoDB ObjectId를 입력하세요 (예: 65a1b2c3d4e5f6g7h8i9j0k1)"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    점검 상세 내용이 담긴 공지사항의 <strong>MongoDB ObjectId</strong>를 입력하세요.
                                    <br />
                                    공지사항 관리 페이지에서 공지사항 ID를 확인할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                onClick={() => setShowMaintenanceModal(false)}
                                variant="outline"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleMaintenanceSubmit}
                                variant="primary"
                                isLoading={setMaintenanceMutation.isPending}
                            >
                                확인
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
