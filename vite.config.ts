import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // listen on IPv4 + IPv6 so both localhost and 127.0.0.1 work
    port: 5173,
    strictPort: true,  // fail loudly instead of silently moving to another port
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
