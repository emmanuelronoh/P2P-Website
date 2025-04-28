import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      // Fix for React 17+ JSX runtime
      jsxRuntime: 'classic'
    }),
    nodePolyfills({
      // Updated polyfill configuration
      include: [
        'buffer',
        'process',
        'util',
        'stream',
        'crypto',
        'http',
        'https',
        'os'
      ],
      globals: {
        Buffer: true,
        process: true,
        global: true
      },
      protocolImports: true // Important for Web3 compatibility
    })
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis'
  },
  resolve: {
    alias: {
      // Updated aliases for better compatibility
      buffer: 'buffer/',
      process: 'process/browser',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      // Add zlib if needed
      zlib: 'browserify-zlib'
    }
  },
  optimizeDeps: {
    include: [
      // Core polyfills
      'buffer',
      'stream-browserify',
      'crypto-browserify',
      'stream-http',
      'https-browserify',
      'os-browserify',
      
      // Web3 dependencies
      'web3',
      'ethers',
      '@ethersproject/providers',
      '@walletconnect/web3-provider',
      'eth-block-tracker',
      'safe-event-emitter',
      'ethereumjs-util',
      
      // UI libraries
      '@chakra-ui/react',
      'framer-motion'
    ],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis'
      },
      // Fix for Node.js global
      inject: ['./src/global.js'] // Create this file if needed
    }
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    chunkSizeWarningLimit: 2000, // Increased limit
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          web3: [
            'web3',
            'ethers',
            '@ethersproject/providers',
            '@walletconnect/web3-provider'
          ],
          ui: ['@chakra-ui/react', 'framer-motion'],
          polyfills: [
            'buffer',
            'stream-browserify',
            'crypto-browserify'
          ]
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Important for HMR
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    // Fix for WebSocket issues
    watch: {
      usePolling: true,
      interval: 100
    }
  }
});