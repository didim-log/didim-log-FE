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
      // React 중복 로드 방지를 위한 명시적 alias 지정
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-is', 'recharts'],
    force: true, // 의존성 사전 번들링 강제 재실행
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
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('@tanstack/react-query') || id.includes('axios') || id.includes('zustand')) {
            return 'data-vendor';
          }
          if (
            id.includes('recharts')
          ) {
            return 'charts-vendor';
          }
          if (id.includes('@dnd-kit') || id.includes('@uiw/react-md-editor')) {
            return 'editor-vendor';
          }
          if (id.includes('react-markdown') || id.includes('react-syntax-highlighter')) {
            return 'markdown-vendor';
          }
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          return undefined;
        },
        // chunk 파일명에 해시를 포함하여 캐싱 최적화
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  preview: {
    port: 5173,
  },
})
