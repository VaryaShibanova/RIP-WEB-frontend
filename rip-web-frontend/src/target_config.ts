// src/target_config.ts
const target_tauri = !!(window as any).__TAURI__;
const isGitHubPages = !target_tauri && window.location.hostname.includes('github.io');

// Для GitHub Pages используем прямой URL к бэкенду
export const api_proxy_addr = "http://localhost:8080"
export const img_proxy_addr = "http://localhost:9000"

// ЗАМЕНИТЕ на ваш реальный бэкенд URL (если он в интернете)
export const backend_production_url = "https://your-backend.railway.app" // ИЛИ другой хостинг

export const dest_api = isGitHubPages 
  ? `${backend_production_url}/api` 
  : target_tauri ? api_proxy_addr : "/api"

export const dest_img = target_tauri ? img_proxy_addr : "/img-proxy"

console.log('Config:', {
  tauri: target_tauri,
  githubPages: isGitHubPages,
  api: dest_api
});