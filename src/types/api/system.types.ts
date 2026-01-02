/**
 * 시스템 관련 API 타입 정의
 */

export interface SystemStatusResponse {
    underMaintenance: boolean;
    maintenanceMessage?: string | null;
}

