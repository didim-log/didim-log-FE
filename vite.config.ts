import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // React 17+ 자동 JSX 런타임 사용
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/constants': path.resolve(__dirname, './src/constants'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react-is', 'recharts'],
    esbuildOptions: {
      // react-is의 named exports를 명시적으로 처리
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React 코어는 반드시 react-vendor에만 포함 (가장 우선)
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react/jsx-runtime') ||
              id.includes('node_modules/react/jsx-dev-runtime')
            ) {
              return 'react-vendor'
            }
            // React를 사용하는 라이브러리들 (React 의존성)
            if (
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react-joyride') ||
              id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/@dnd-kit') ||
              id.includes('node_modules/sonner') ||
              id.includes('node_modules/@uiw/react-md-editor') ||
              id.includes('node_modules/recharts') ||
              id.includes('node_modules/react-syntax-highlighter') ||
              id.includes('node_modules/react-markdown')
            ) {
              return 'react-vendor'
            }
            // 나머지 node_modules (React를 사용하지 않는 라이브러리들)
            return 'vendor'
          }
        },
      },
    },
  },
})
