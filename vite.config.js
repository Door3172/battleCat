// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 要用子路徑：/<repo名>/
// 你的 repo 是 battleCat，所以 base = '/battleCat/'
export default defineConfig({
  base: '/battleCat/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // React 拆成獨立檔案：遊戲更新時檔名（hash）不變，玩家瀏覽器可沿用快取（EG-013）
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
  test: { environment: 'jsdom' },
})
