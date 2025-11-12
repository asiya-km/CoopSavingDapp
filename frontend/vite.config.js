import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel-specific configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  // CRITICAL: Use absolute paths for Vercel
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimize for Vercel
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Fix for ethers and global issues
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify'
    }
  },
  optimizeDeps: {
    include: ['ethers'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: []
    }
  }
})