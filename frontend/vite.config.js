import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },
  optimizeDeps: {
    force: false, // Set to true only when needed
    include: [
      '@chakra-ui/react',
      '@chakra-ui/icons',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'axios'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
