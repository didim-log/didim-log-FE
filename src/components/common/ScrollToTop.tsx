/**
 * ScrollToTop 컴포넌트
 * 페이지 이동 시 스크롤을 맨 위로 이동시킵니다.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};
