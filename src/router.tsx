import { createBrowserRouter } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProblemPage from './pages/ProblemPage'
import RetrospectiveWritePage from './pages/RetrospectiveWritePage'

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
        path: '/problems/:problemId',
        element: <ProblemPage />,
    },
    {
        path: '/retrospectives/new/:problemId',
        element: <RetrospectiveWritePage />,
    },
])

