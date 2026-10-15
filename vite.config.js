import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devApiPlugin } from './server/admin/devMiddleware.js'

export default defineConfig({
  plugins: [react(), ...devApiPlugin()],
  build: {
    outDir: 'dist',
  }
})
