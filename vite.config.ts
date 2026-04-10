
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Menambahkan base: './' sangat penting untuk hosting seperti Plesk/cPanel
  // agar file index.html mencari aset (js/css) di folder yang sama, bukan root domain.
  base: './',
  define: {
    // Menyediakan env variable process.env agar kompatibel dengan kode yang ada
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
