/**
 * React Router 설정
 */

/* eslint-disable react-refresh/only-export-components */

import { Suspense, lazy } from 'react';
import type { ReactElement } from 'react';
import { createBrowserRouter, useRouteError, Link, useNavigate } from 'react-router-dom';
import { PublicRoute } from './routes/PublicRoute';
import { PrivateRoute } from './routes/PrivateRoute';
import { AdminRoute } from './routes/AdminRoute';
import { RootRedirect } from './routes/RootRedirect';

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const OAuthCallbackPage = lazy(() =>
    import('./pages/auth/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage }))
);
const FindIdPage = lazy(() => import('./features/auth/pages/FindIdPage').then((m) => ({ default: m.FindIdPage })));
const FindPasswordPage = lazy(() =>
    import('./features/auth/pages/FindPasswordPage').then((m) => ({ default: m.FindPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
    import('./features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const DashboardPage = lazy(() =>
    import('./features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ProblemListPage = lazy(() =>
    import('./features/problem/pages/ProblemListPage').then((m) => ({ default: m.ProblemListPage }))
);
const ProblemDetailPage = lazy(() =>
    import('./features/problem/pages/ProblemDetailPage').then((m) => ({ default: m.ProblemDetailPage }))
);
const StudyPage = lazy(() => import('./features/study/pages/StudyPage').then((m) => ({ default: m.StudyPage })));
const RetrospectiveListPage = lazy(() =>
    import('./features/retrospective/pages/RetrospectiveListPage').then((m) => ({ default: m.RetrospectiveListPage }))
);
const RetrospectiveDetailPage = lazy(() =>
    import('./features/retrospective/pages/RetrospectiveDetailPage').then((m) => ({ default: m.RetrospectiveDetailPage }))
);
const RetrospectiveWritePage = lazy(() =>
    import('./features/retrospective/pages/RetrospectiveWritePage').then((m) => ({ default: m.RetrospectiveWritePage }))
);
const StatisticsPage = lazy(() =>
    import('./features/statistics/pages/StatisticsPage').then((m) => ({ default: m.StatisticsPage }))
);
const RankingPage = lazy(() => import('./features/ranking/pages/RankingPage').then((m) => ({ default: m.RankingPage })));
const NoticeListPage = lazy(() =>
    import('./features/notice/pages/NoticeListPage').then((m) => ({ default: m.NoticeListPage }))
);
const NoticeDetailPage = lazy(() =>
    import('./features/notice/pages/NoticeDetailPage').then((m) => ({ default: m.NoticeDetailPage }))
);
const MaintenancePage = lazy(() =>
    import('./pages/MaintenancePage').then((m) => ({ default: m.MaintenancePage }))
);
const AdminDashboardPage = lazy(() =>
    import('./features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminUsersPage = lazy(() =>
    import('./features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);

const RouteFallback = () => (
    <div className="flex items-center justify-center min-h-[30vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
    </div>
);

const withRouteSuspense = (element: ReactElement) => (
    <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

// 에러 페이지 (404 및 런타임 에러 모두 처리)
const ErrorPage = () => {
    const error = useRouteError();
    const navigate = useNavigate();
    
    // 에러가 Response 객체인 경우 (404 등)
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        요청하신 페이지가 존재하지 않습니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            ← 이전 페이지
                        </button>
                        <Link
                            to="/dashboard"
                            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                        >
                            대시보드로 이동
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    // 런타임 에러인 경우 (실제 JavaScript 에러)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-4xl w-full">
                <h1 className="text-6xl font-bold text-red-500 dark:text-red-400 mb-4">⚠️</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    오류가 발생했습니다
                </h2>
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 text-left">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                        에러 메시지:
                    </h3>
                    <p className="text-red-700 dark:text-red-300 font-mono text-sm mb-4 break-words">
                        {errorMessage || '알 수 없는 오류'}
                    </p>
                    {errorStack && (
                        <>
                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2 mt-4">
                                스택 트레이스:
                            </h3>
                            <pre className="text-red-600 dark:text-red-400 text-xs overflow-auto max-h-60 bg-red-100 dark:bg-red-950/50 p-3 rounded border border-red-200 dark:border-red-900">
                                {errorStack}
                            </pre>
                        </>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                        ← 이전 페이지
                    </button>
                    <Link
                        to="/dashboard"
                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                        대시보드로 이동
                    </Link>
                </div>
            </div>
        </div>
    );
};

// 404 전용 페이지 (명시적인 404인 경우)
const NotFoundPage = () => {
    const navigate = useNavigate();
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    페이지를 찾을 수 없습니다
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    요청하신 페이지가 존재하지 않습니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                        ← 이전 페이지
                    </button>
                    <Link
                        to="/dashboard"
                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                        대시보드로 이동
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootRedirect />,
        errorElement: <ErrorPage />,
    },
    {
        path: '/login',
        element: withRouteSuspense(
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/signup', // 회원가입 페이지 경로 (LoginPage의 NOT_FOUND 에러에서 Link로 연결됨)
        element: withRouteSuspense(
            <PublicRoute>
                <SignupPage />
            </PublicRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/oauth/callback',
        element: withRouteSuspense(<OAuthCallbackPage />),
        errorElement: <ErrorPage />,
    },
    {
        path: '/find-id',
        element: withRouteSuspense(
            <PublicRoute>
                <FindIdPage />
            </PublicRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/find-password',
        element: withRouteSuspense(
            <PublicRoute>
                <FindPasswordPage />
            </PublicRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/reset-password',
        element: withRouteSuspense(
            <PublicRoute>
                <ResetPasswordPage />
            </PublicRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/dashboard',
        element: withRouteSuspense(
            <PrivateRoute>
                <DashboardPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/problems',
        element: withRouteSuspense(
            <PrivateRoute>
                <ProblemListPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/problems/:problemId',
        element: withRouteSuspense(
            <PrivateRoute>
                <ProblemDetailPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/study/:problemId',
        element: withRouteSuspense(
            <PrivateRoute>
                <StudyPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/retrospectives',
        element: withRouteSuspense(
            <PrivateRoute>
                <RetrospectiveListPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/retrospectives/:id',
        element: withRouteSuspense(
            <PrivateRoute>
                <RetrospectiveDetailPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/retrospectives/write',
        element: withRouteSuspense(
            <PrivateRoute>
                <RetrospectiveWritePage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/statistics',
        element: withRouteSuspense(
            <PrivateRoute>
                <StatisticsPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/ranking',
        element: withRouteSuspense(
            <PrivateRoute>
                <RankingPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/notices',
        element: withRouteSuspense(
            <PrivateRoute>
                <NoticeListPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/notices/:id',
        element: withRouteSuspense(
            <PrivateRoute>
                <NoticeDetailPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/profile',
        element: withRouteSuspense(
            <PrivateRoute>
                <ProfilePage />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/admin/dashboard',
        element: withRouteSuspense(
            <AdminRoute>
                <AdminDashboardPage />
            </AdminRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/admin/users',
        element: withRouteSuspense(
            <AdminRoute>
                <AdminUsersPage />
            </AdminRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/maintenance',
        element: withRouteSuspense(<MaintenancePage />),
        errorElement: <ErrorPage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
