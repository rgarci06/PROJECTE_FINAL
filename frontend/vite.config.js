import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3007',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Mantener /api en la ruta
      },
      '/uploads': {
        target: 'http://localhost:3007',
        changeOrigin: true,
      },
    },
  },
});