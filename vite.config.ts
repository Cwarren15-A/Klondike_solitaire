/// <reference types="node" />
// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isProd = process.env.NODE_ENV === 'production';
const base = isProd ? '/Klondike_solitaire/' : '/';
const assetPrefix = isProd ? '/Klondike_solitaire' : '';

export default defineConfig({
  base,
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        `${assetPrefix}/favicon.ico`,
        `${assetPrefix}/apple-touch-icon.png`,
        `${assetPrefix}/masked-icon.svg`
      ],
      manifest: {
        name: 'Klondike Solitaire Advanced',
        short_name: 'Solitaire AI',
        description: 'Advanced Klondike Solitaire with React, TypeScript, and Real TensorFlow.js ML',
        theme_color: '#1e5128',
        background_color: '#1e5128',
        display: 'standalone',
        orientation: 'any',
        categories: ['games', 'entertainment'],
        lang: 'en',
        start_url: base,
        icons: [
          {
            src: `${assetPrefix}/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `${assetPrefix}/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'New Game',
            short_name: 'New Game',
            description: 'Start a new Klondike Solitaire game',
            url: `${base}?action=new`,
            icons: [{ src: `${assetPrefix}/icon-192.png`, sizes: '192x192' }]
          },
          {
            name: 'Daily Challenge',
            short_name: 'Daily',
            description: 'Play today\'s daily challenge',
            url: `${base}?action=daily`,
            icons: [{ src: `${assetPrefix}/icon-192.png`, sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@assets': resolve(__dirname, './src/assets')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tensorflow-vendor': ['@tensorflow/tfjs', '@tensorflow/tfjs-core'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    host: true, // Allow external connections
    open: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // TypeScript configuration
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@webgpu/types']
  }
})

// Additional configuration info
export const VITE_TEMPLATE_INFO = {
  purpose: "Modern Vite build system for React version",
  currentApproach: "React + TypeScript + TensorFlow.js",
  features: "Real ML, component architecture, modern tooling",
  dependencies: [
    "vite",
    "@vitejs/plugin-react",
    "vite-plugin-pwa",
    "typescript"
  ]
}; 