import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Expose Vite server on local network (0.0.0.0) for physical mobile phone testing
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  }
})
