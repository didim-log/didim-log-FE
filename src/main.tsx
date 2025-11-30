import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import { FullScreenLoading } from './components/common/Loading'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Suspense fallback={<FullScreenLoading />}>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
