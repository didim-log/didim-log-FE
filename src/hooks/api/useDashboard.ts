/**
 * 대시보드 React Query 훅
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints/dashboard.api';
import { useUserStore } from '../../stores/user.store';
import type { PrimaryLanguage } from '../../types/api/student.types';

export const useDashboard = () => {
    const { setPrimaryLanguage } = useUserStore();
    
    const query = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardApi.getDashboard(),
        staleTime: 1 * 60 * 1000, // 1분
    });
    
    // Dashboard 데이터 로드 시 Primary Language 동기화
    useEffect(() => {
        const primaryLang = query.data?.studentProfile?.primaryLanguage;
        if (primaryLang) {
            // string을 PrimaryLanguage 타입으로 캐스팅
            // API 응답은 PrimaryLanguage 형식을 보장해야 하지만, 타입 안전성을 위해 검증
            const validLanguages: PrimaryLanguage[] = ['C', 'CPP', 'CSHARP', 'GO', 'JAVA', 'JAVASCRIPT', 'KOTLIN', 'PYTHON', 'R', 'RUBY', 'SCALA', 'SWIFT', 'TEXT'];
            if (validLanguages.includes(primaryLang as PrimaryLanguage)) {
                setPrimaryLanguage(primaryLang as PrimaryLanguage);
            }
        }
    }, [query.data, setPrimaryLanguage]);
    
    return query;
};
