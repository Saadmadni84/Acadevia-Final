import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function databaseApiPlugin() {
  return {
    name: 'database-api-plugin',
    enforce: 'pre' as const,
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const parsedUrl = new URL(req.url || '', 'http://localhost:5173');
        if (parsedUrl.pathname === '/api/v1/teacher/students') {
          try {
            const classGrade = Number(parsedUrl.searchParams.get('classGrade')) || 10;
            const { getTeacherStudentsFromDb } = require('./src/scripts/databaseApi.cjs');
            const data = getTeacherStudentsFromDb(classGrade);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 200, success: true, data }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }
        if (parsedUrl.pathname === '/api/v1/teacher/analytics') {
          try {
            const classGrade = Number(parsedUrl.searchParams.get('classGrade')) || 10;
            const subject = parsedUrl.searchParams.get('subject') || 'All';
            const { getTeacherAnalyticsFromDb } = require('./src/scripts/databaseApi.cjs');
            const data = getTeacherAnalyticsFromDb(classGrade, subject);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 200, success: true, data }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    databaseApiPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Acadevia',
        short_name: 'Acadevia',
        description: "India's largest gamified learning platform",
        theme_color: '#6C63FF',
        background_color: '#F8F9FE',
        display: 'standalone',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.acadevia\.in\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
