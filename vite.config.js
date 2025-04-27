import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      util: 'util/',
      sys: 'util/',
      events: 'events/',
      stream: 'stream-browserify',
      path: 'path-browserify',
      querystring: 'querystring-es3',
      punycode: 'punycode/',
      url: 'url/',
      string_decoder: 'string_decoder/',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      assert: 'assert/',
      constants: 'constants-browserify',
      _stream_duplex: 'readable-stream/duplex',
      _stream_passthrough: 'readable-stream/passthrough',
      _stream_readable: 'readable-stream/readable',
      _stream_writable: 'readable-stream/writable',
      _stream_transform: 'readable-stream/transform',
      process: 'process/browser',
      buffer: 'buffer/',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyFill(),
      ],
      output: {
        manualChunks: {
          ethers: ['ethers'],
          walletconnect: ['@walletconnect/client'],
          react: ['react', 'react-dom'],
          reactRouter: ['react-router-dom'],
          framer: ['framer-motion'],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
