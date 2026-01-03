import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    include: ['react-is', 'recharts'],
    esbuildOptions: {
      // react-is의 named exports를 명시적으로 처리
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor'
            }
            if (id.includes('@uiw/react-md-editor') || id.includes('recharts') || id.includes('lucide-react')) {
              return 'ui-vendor'
            }
            if (id.includes('canvas-confetti') || id.includes('sonner') || id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'utils-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
