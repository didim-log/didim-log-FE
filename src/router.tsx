import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProblemPage = lazy(() => import('./pages/ProblemPage'))
const RetrospectiveWritePage = lazy(() => import('./pages/RetrospectiveWritePage'))
const RecommendedProblemsPage = lazy(() => import('./pages/RecommendedProblemsPage'))
const MyPage = lazy(() => import('./pages/MyPage'))

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LoginPage />,
    },
    {
        path: '/dashboard',
        element: <DashboardPage />,
    },
    {
        path: '/problems',
        element: <RecommendedProblemsPage />,
    },
    {
        path: '/problems/:problemId',
        element: <ProblemPage />,
    },
    {
        path: '/retrospectives/new/:problemId',
        element: <RetrospectiveWritePage />,
    },
    {
        path: '/mypage',
        element: <MyPage />,
    },
])

