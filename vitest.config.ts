import { defineConfig } from 'vite'
import path from 'path';
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './')
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  }
})