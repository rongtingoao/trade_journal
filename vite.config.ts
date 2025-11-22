import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Change this to your repository name for GitHub Pages
  // e.g. if your repo is https://github.com/user/my-trade-app, set base to '/my-trade-app/'
  base: '/trade-journal/', 
})