import {
  defineConfig,
} from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../resources/public/",
    emptyOutDir: true,
  },
  base: "/app",
  server: {
    port: 3006,
    proxy: {
      "/app/api": {
        target: "http://localhost:8102",
      },
      "/app/ws": {
        target: "ws://localhost:8102",
        ws: true,
      }
    },
  },
  // https://dev.to/andrewezeani/how-to-create-absolute-imports-in-vite-react-app-a-step-by-step-guide-28co
  resolve: {
    alias: {
      src: "/src",
    },
  },
})
