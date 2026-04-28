import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/simplePhotoBooth/',

  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['icon.svg', 'icons/*.png'],
      manifest: {
        name: 'Simple Photo Booth',
        short_name: 'PhotoBooth',
        description: 'A fun PWA photo booth with countdown, themes, and save-to-device.',
        theme_color: '#09090f',
        background_color: '#09090f',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/simplePhotoBooth/',
        start_url: '/simplePhotoBooth/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
