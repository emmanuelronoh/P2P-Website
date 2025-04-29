import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // Polyfill for 'global'
  define: {
    global: 'window',  // This will resolve the 'global is not defined' issue
  }
});
