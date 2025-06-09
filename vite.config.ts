// vite.config.ts - Future Build Configuration Template
// This is a template for when you decide to modernize to a React/Vite setup
// Your current HTML file approach is working perfectly and doesn't need this!

// Note: This file will only be used if you migrate to a modern build system

/*
// Uncomment and modify when you're ready to use Vite:

import { defineConfig } from 'vite'

export default defineConfig({
  // Basic configuration for static HTML serving
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize for your single HTML file
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  // PWA configuration (when you add Vite PWA plugin)
  // plugins: [
  //   VitePWA({
  //     registerType: 'autoUpdate',
  //     workbox: {
  //       globPatterns: ['**\/*.{js,css,html,ico,png,svg}']
  //     }
  //   })
  // ]
})
*/

// For now, this is just configuration info
export const VITE_TEMPLATE_INFO = {
  purpose: "Future Vite build system template",
  currentApproach: "Single HTML file (working perfectly)",
  whenToUse: "Only if you want modern build tooling",
  dependencies: [
    "vite",
    "@vitejs/plugin-react (if using React)",
    "vite-plugin-pwa (for enhanced PWA features)",
    "typescript (if using TypeScript)"
  ],
  currentRecommendation: "Your HTML approach is working great - no need to change!"
};

export default VITE_TEMPLATE_INFO; 