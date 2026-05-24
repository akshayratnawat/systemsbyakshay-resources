import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/systemsbyakshay-resources/roadmap/',
  build: {
    outDir: '../roadmap',
    emptyOutDir: true,
  },
})
