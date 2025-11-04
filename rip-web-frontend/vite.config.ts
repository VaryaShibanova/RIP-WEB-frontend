import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Дендроанализ",
        short_name: "Дендроанализ",
        start_url: "/RIP-WEB-frontend/",
        display: "standalone",
        background_color: "#060F1E",
        theme_color: "#060F1E",
        orientation: "portrait-primary",
        icons: [
          {
            src: "icon-180x180.png",
            type: "image/png",
            sizes: "180x180",
            purpose: "any maskable"
          },
          {
            src: "icon-192x192.png",
            type: "image/png",
            sizes: "192x192"
          },
          {
            src: "icon-512x512.png",
            type: "image/png",
            sizes: "512x512"
          }
        ],
      }
    }),
  ],
  base: "/RIP-WEB-frontend/",
  server: {
    https:{
    key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
  },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        //target: "http://192.168.8.104:8080",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    }, 
    host: true,
    strictPort: true,
    port: 3000,
  },
})