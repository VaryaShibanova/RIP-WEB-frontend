import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  define: {
    // Добавьте эту строку для глобального process
    'process.env': {}
  },
  base: '/',
  server: {
    port: 3000,
    proxy: {
      "/api-proxy": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, "/api"),
      },
      "/img-proxy": {
        target: "http://localhost:9000", 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img-proxy/, ""),
      },
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
    host: '172.20.10.7',
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: [],
      },
      manifest: {
        name: "Дендроанализ",
        short_name: "Дендроанализ",
        start_url: "/",
        display: "standalone",
        background_color: "#060F1E",
        theme_color: "#060F1E",
        orientation: "portrait-primary",
        icons: [
          {
            "src": "./icon-192x192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "./icon-512x512.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
      }
    }),
  ],
  build: {
    outDir: 'dist',
  },
})