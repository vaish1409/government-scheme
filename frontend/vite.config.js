import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The PWA plugin auto-generates the service worker that lets lessons and
// scheme data keep working offline. workbox caches API responses and static
// assets using the strategies below — this is what makes "poor connectivity"
// actually usable rather than just a buzzword in the pitch.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Saksham — Learn & Discover Schemes',
        short_name: 'Saksham',
        description: 'Bite-sized financial & health lessons, and a govt scheme eligibility checker — built to work offline.',
        theme_color: '#0F6B5C',
        background_color: '#FBF8F2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // Lesson & scheme catalog data — cache first, fall back to network,
            // so previously-loaded content works with zero connectivity.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/lessons') || url.pathname.startsWith('/api/schemes'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-catalog-cache' },
          },
          {
            // Audio/video lesson media — cache first once downloaded
            urlPattern: ({ request }) => request.destination === 'audio' || request.destination === 'video',
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
