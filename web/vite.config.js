import { defineConfig } from 'vite'
import { homepageContent } from './content-plugin.js'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [homepageContent(), react(), viteSingleFile()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: Infinity,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
