import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // УБРАТЬ rewrite - бэкенд должен получать /api/anomalies
        // rewrite: (path) => path.replace(/^\/api/, "/"),
      },
    },
    watch: {
        usePolling: true,
    }, 
    host: true,
    strictPort: true,
    port: 3000,
  },
});