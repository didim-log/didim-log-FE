/**
 * 시스템 관련 API 타입 정의
 */

export interface SystemStatusResponse {
    underMaintenance: boolean;
    maintenanceMessage?: string | null;
    startTime?: string | null; // ISO 8601 형식 (yyyy-MM-ddTHH:mm:ss)
    endTime?: string | null;   // ISO 8601 형식 (yyyy-MM-ddTHH:mm:ss)
    noticeId?: string | null;    // 관련 공지사항 ID
}
