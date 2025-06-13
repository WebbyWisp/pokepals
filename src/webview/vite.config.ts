import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: '../../dist/webview',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, 'components'),
      '@/composables': resolve(__dirname, 'composables'),
      '@/stores': resolve(__dirname, 'stores'),
      '@/types': resolve(__dirname, 'types'),
      '@/utils': resolve(__dirname, 'utils'),
      '@/styles': resolve(__dirname, 'styles')
    }
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  },
  server: {
    port: 3000,
    strictPort: true
  }
})
