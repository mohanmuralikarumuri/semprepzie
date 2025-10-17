import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production to save memory
    minify: 'esbuild', // Use faster esbuild instead of terser
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react'],
        },
      },
      // Reduce memory usage during build
      maxParallelFileOps: 1, // Reduce to 1 for low memory environments
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500,
    // Reduce memory usage
    target: 'es2015',
    // Optimize for low memory
    assetsInlineLimit: 4096, // Inline smaller assets
    cssCodeSplit: true, // Split CSS to reduce memory
    reportCompressedSize: false, // Skip gzip reporting to save memory
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
