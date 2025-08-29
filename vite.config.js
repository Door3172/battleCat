// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 要用子路徑：/<repo名>/
// 你的 repo 是 battleCat，所以 base = '/battleCat/'
export default defineConfig({
  base: '/battleCat/',
  plugins: [react()],
  test: { environment: 'jsdom' },
})
