
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Menggunakan base: '/' agar routing SPA pda sinkron saat refresh di sub-route.
  base: '/',
  define: {
    // Menyediakan env variable process.env agar kompatibel dengan kode yang ada
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
