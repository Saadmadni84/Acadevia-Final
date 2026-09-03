import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
  });
}

function databaseApiPlugin() {
  return {
    name: 'database-api-plugin',
    enforce: 'pre' as const,
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const parsedUrl = new URL(req.url || '', 'http://localhost:5173');
        const pathname = parsedUrl.pathname;

        // Set standard CORS & headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const db = require('./src/scripts/databaseApi.cjs');

        // 0. Lightweight State Version Check (< 0.1ms, zero DB queries)
        if (pathname === '/api/v1/data/version' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify({ status: 200, success: true, data: { version: db.getStateVersion() } }));
          return;
        }

        // 1. Full Shared State
        if (pathname === '/api/v1/data/state' && req.method === 'GET') {
          try {
            const data = db.getFullDatabaseState();
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

        // 2. Teacher Students
        if (pathname === '/api/v1/teacher/students' && req.method === 'GET') {
          try {
            const classGrade = Number(parsedUrl.searchParams.get('classGrade')) || 10;
            const data = db.getTeacherStudentsFromDb(classGrade);
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

        // 3. Teacher Analytics
        if (pathname === '/api/v1/teacher/analytics' && req.method === 'GET') {
          try {
            const classGrade = Number(parsedUrl.searchParams.get('classGrade')) || 10;
            const subject = parsedUrl.searchParams.get('subject') || 'All';
            const data = db.getTeacherAnalyticsFromDb(classGrade, subject);
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

        // 4. Quizzes
        if (pathname === '/api/v1/quizzes' && req.method === 'GET') {
          try {
            const data = db.getQuizzesFromDb();
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

        if (pathname === '/api/v1/quizzes' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const data = db.createQuizInDb(body);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 201, success: true, data }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }

        // 5. Quiz Attempts / Submissions
        if (pathname === '/api/v1/attempts' && req.method === 'GET') {
          try {
            const data = db.getQuizAttemptsFromDb();
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

        if ((pathname === '/api/v1/attempts' || pathname === '/api/v1/quiz-attempts') && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const data = db.submitAttemptToDb(body);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 201, success: true, data }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }

        // 6. Content Items
        if (pathname === '/api/v1/content/items' && req.method === 'GET') {
          try {
            const data = db.getContentItemsFromDb();
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

        if (pathname === '/api/v1/content/items' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const data = db.createContentItemInDb(body);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 201, success: true, data }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }

        if (pathname.startsWith('/api/v1/content/items/') && req.method === 'DELETE') {
          try {
            const id = pathname.replace('/api/v1/content/items/', '');
            db.deleteContentItemFromDb(id);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 200, success: true }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }

        // 7. Users
        if (pathname === '/api/v1/users' && req.method === 'GET') {
          try {
            const data = db.getUsersFromDb();
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
