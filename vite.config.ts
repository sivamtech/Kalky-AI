import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This ensures the app looks for assets in /test/ instead of root /
  base: '/test/',
  define: {
    // This allows the app to access the API key safely during the build
    'process.env': process.env
  }
});