import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Route /api and /artifacts requests to the FastAPI backend in dev mode
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/artifacts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
