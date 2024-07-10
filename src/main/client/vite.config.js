import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../resources/public/',
    emptyOutDir: true,
  },
  base: '/app',
  server: {
    port: 3006,
    proxy: {
      '/app/data': {
        target: 'http://localhost:8080',
      },
      '/app/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      }
    },
  },
})
