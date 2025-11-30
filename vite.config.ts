import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
