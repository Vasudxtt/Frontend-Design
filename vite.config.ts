import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@tiptap')) return 'editor';
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';
          if (id.includes('@tanstack')) return 'query';
          if (id.includes('react-hook-form') || id.includes('zod')) return 'forms';
          if (id.includes('zustand') || id.includes('axios')) return 'state';
        },
      },
    },
  },
});
