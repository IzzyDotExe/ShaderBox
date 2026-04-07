import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      '@shadcn': path.resolve(__dirname, './@shadcn'),
    },
  },
})
