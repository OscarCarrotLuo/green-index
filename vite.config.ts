import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ base: '/green-index/', plugins: [react()], build: { chunkSizeWarningLimit: 1300 }, server: { host: '127.0.0.1', port: 5173 } });
