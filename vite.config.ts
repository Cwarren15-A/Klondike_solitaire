// vite.config.ts - Future Build Configuration Template
// This is a template for when you decide to modernize to a React/Vite setup
// Your current HTML file approach is working perfectly and doesn't need this!

// Note: This file will only be used if you migrate to a modern build system

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
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
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
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
            url: '/?action=new',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Daily Challenge',
            short_name: 'Daily',
            description: 'Play today\'s daily challenge',
            url: '/?action=daily',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
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
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          react: ['react', 'react-dom'],
          tensorflow: ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgl'],
          animations: ['framer-motion', 'react-spring'],
          gestures: ['react-use-gesture'],
          state: ['zustand']
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
      'framer-motion',
      'zustand'
    ]
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