import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
optimizeDeps: {
  include: ['react', 'react-dom'],
  // @ts-ignore — Vite supports this field, but types are outdated
  dedupe: ['react', 'react-dom'],
  },
})