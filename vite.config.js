import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://maqmohamed82-001-site1.qtempurl.com',
        changeOrigin: true,
        secure: false
      }
    }
    //port: 5173
  }
})
