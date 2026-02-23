import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3005',
        // target: 'https://api.nexabank.it',
        changeOrigin: true,
        ws: true, // ← 🔥 fondamentale per socket.io
        secure: true,
      },
      '/api': {
        // target: 'https://api.nexabank.it',,
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
