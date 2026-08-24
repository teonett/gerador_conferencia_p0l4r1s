import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), cloudflare(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/.wrangler/**', '**/dist/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-jspdf': ['jspdf'],
          'vendor-html2canvas': ['html2canvas'],
        },
      },
    },
  },
});
