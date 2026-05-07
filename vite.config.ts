import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    proxy: {
      '/api/n8n/webhook/auth': {
        target: 'http://127.0.0.1:3001',
        rewrite: (path) => path.replace('/api/n8n/webhook/auth', '/webhook/auth'),
        changeOrigin: true
      },
      '/api/n8n/webhook/auth': {
        target: 'http://127.0.0.1:3001',
        rewrite: (path) => path.replace('/api/n8n/webhook/auth', '/webhook/auth'),
        changeOrigin: true
      },
      '/api/n8n': {
        target: 'https://n8n.yuriybevov.ru',
        changeOrigin: true
      },
      '/api/qdrant': {
        target: 'http://185.207.0.152:6333',
        rewrite: (path) => path.replace('/api/qdrant', '/'),
        changeOrigin: true
      }
    },
    allowedHosts: ['impression.yuriybevov.ru'],
  },
  build: {
    // Force single bundle to avoid PrimeVue split-chunk issue
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
