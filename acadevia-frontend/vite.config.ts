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

        if (!pathname.startsWith('/api/v1/')) {
          return next();
        }

        // Set standard CORS & headers for API routes
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const dbModulePath = require.resolve('./src/scripts/databaseApi.cjs');
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');
        const UPLOADS_DIR = path.resolve(__dirname, 'uploads', 'content');
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        const mtime = fs.statSync(dbModulePath).mtimeMs;
        if ((global as any).__dbMtime !== mtime) {
          delete require.cache[dbModulePath];
          (global as any).__dbMtime = mtime;
        }
        const db = require('./src/scripts/databaseApi.cjs');

        // 0. Lightweight State Version Check (< 0.1ms, zero DB queries)
        if (pathname === '/api/v1/data/version' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify({ status: 200, success: true, data: { version: db.getStateVersion() } }));
          return;
        }

        // Leaderboard (Weekly, Monthly, All Time)
        if (pathname === '/api/v1/leaderboard' && req.method === 'GET') {
          try {
            const period = parsedUrl.searchParams.get('period') || 'weekly';
            const data = db.getLeaderboardFromDb(period);
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

        // 4. Quizzes (List or Single Quiz by ID)
        if ((pathname === '/api/v1/quizzes' || pathname.startsWith('/api/v1/quizzes/')) && req.method === 'GET') {
          try {
            let quizId = parsedUrl.searchParams.get('id');
            if (!quizId && pathname.startsWith('/api/v1/quizzes/')) {
              quizId = decodeURIComponent(pathname.replace('/api/v1/quizzes/', '').trim());
            }

            if (quizId) {
              const quiz = db.getQuizByIdFromDb(quizId);
              if (!quiz) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 404, error: 'Quiz not found' }));
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 200, success: true, data: quiz }));
              return;
            }

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

        // 4.1 Delete / Archive Quiz
        if (pathname.startsWith('/api/v1/quizzes/') && req.method === 'DELETE') {
          try {
            const rawQuizId = pathname.replace('/api/v1/quizzes/', '').trim();
            const quizId = decodeURIComponent(rawQuizId);
            const authHeader = req.headers['authorization'] || '';
            const requestingUserId = req.headers['x-user-id'] || '';
            const requestingUserRole = req.headers['x-user-role'] || '';

            const result = db.deleteQuizFromDb({
              quizId,
              requestingUserId,
              requestingUserRole,
              authHeader,
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 200, success: true, data: result }));
            return;
          } catch (err: any) {
            const statusCode = err.statusCode || (err.message?.includes('Access denied') ? 403 : err.message?.includes('not found') ? 404 : 500);
            res.statusCode = statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: statusCode, error: err.message }));
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

        // 5.5 File Upload (Multipart & Binary Stream Support)
        if (pathname === '/api/v1/content/upload' && req.method === 'POST') {
          try {
            const contentTypeHeader = req.headers['content-type'] || '';
            const isMultipart = contentTypeHeader.includes('multipart/form-data');
            const originalName = req.headers['x-filename']
              ? decodeURIComponent(req.headers['x-filename'] as string)
              : 'uploaded_file';

            const rawExt = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
            const fallbackExt = contentTypeHeader.includes('pdf')
              ? '.pdf'
              : contentTypeHeader.includes('mp4')
              ? '.mp4'
              : contentTypeHeader.includes('webm')
              ? '.webm'
              : contentTypeHeader.includes('png')
              ? '.png'
              : contentTypeHeader.includes('jpeg') || contentTypeHeader.includes('jpg')
              ? '.jpg'
              : '.bin';
            const ext = rawExt || fallbackExt;

            const fileId = `cnt_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
            const safeFileName = `${fileId}${ext}`;
            const targetPath = path.join(UPLOADS_DIR, safeFileName);

            if (isMultipart) {
              const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
              const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;
              if (!boundary) {
                throw new Error('Missing boundary in multipart/form-data');
              }

              const chunks: Buffer[] = [];
              req.on('data', (chunk: Buffer) => chunks.push(chunk));
              await new Promise((resolve, reject) => {
                req.on('end', resolve);
                req.on('error', reject);
              });
              const buffer = Buffer.concat(chunks);

              const boundaryBuffer = Buffer.from(`--${boundary}`);
              const headerEndBuffer = Buffer.from('\r\n\r\n');

              const firstBoundary = buffer.indexOf(boundaryBuffer);
              const headerStart = firstBoundary + boundaryBuffer.length;
              const headerEnd = buffer.indexOf(headerEndBuffer, headerStart);

              if (headerEnd === -1) {
                throw new Error('Malformed multipart form data');
              }

              const fileContentStart = headerEnd + headerEndBuffer.length;
              const nextBoundary = buffer.indexOf(boundaryBuffer, fileContentStart);
              const fileContentEnd = nextBoundary !== -1 ? nextBoundary - 2 : buffer.length;

              const fileBuffer = buffer.subarray(fileContentStart, fileContentEnd);
              fs.writeFileSync(targetPath, fileBuffer);

              const stat = fs.statSync(targetPath);
              let mime = 'application/octet-stream';
              if (safeFileName.endsWith('.pdf')) mime = 'application/pdf';
              else if (safeFileName.endsWith('.mp4')) mime = 'video/mp4';
              else if (safeFileName.endsWith('.webm')) mime = 'video/webm';
              else if (safeFileName.endsWith('.png')) mime = 'image/png';
              else if (safeFileName.endsWith('.jpg') || safeFileName.endsWith('.jpeg')) mime = 'image/jpeg';

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 200,
                success: true,
                data: {
                  fileId: safeFileName,
                  fileUrl: `/api/v1/content/files/${safeFileName}`,
                  fileName: originalName,
                  fileSize: stat.size,
                  mimeType: mime,
                },
              }));
              return;
            } else {
              const writeStream = fs.createWriteStream(targetPath);
              await new Promise((resolve, reject) => {
                req.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                req.on('error', reject);
              });

              const stat = fs.statSync(targetPath);
              const mime = (req.headers['x-mime-type'] as string) || contentTypeHeader || 'application/octet-stream';
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 200,
                success: true,
                data: {
                  fileId: safeFileName,
                  fileUrl: `/api/v1/content/files/${safeFileName}`,
                  fileName: originalName,
                  fileSize: stat.size,
                  mimeType: mime,
                },
              }));
              return;
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 500, error: err.message }));
            return;
          }
        }

        // 5.6 File Serving with HTTP Range & Streaming (PDF, MP4, WebM, Images)
        if (pathname.startsWith('/api/v1/content/files/') && req.method === 'GET') {
          try {
            const rawRequested = pathname.replace('/api/v1/content/files/', '');
            const requestedName = path.basename(decodeURIComponent(rawRequested));

            // Security check against directory traversal
            if (!requestedName || requestedName.includes('..') || requestedName.includes('/') || requestedName.includes('\\')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 400, error: 'Invalid file path' }));
              return;
            }

            const filePath = path.join(UPLOADS_DIR, requestedName);
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 404, error: 'File not found on server' }));
              return;
            }

            const stat = fs.statSync(filePath);
            const fileSize = stat.size;

            let mimeType = 'application/octet-stream';
            const lower = requestedName.toLowerCase();
            if (lower.endsWith('.pdf')) mimeType = 'application/pdf';
            else if (lower.endsWith('.mp4')) mimeType = 'video/mp4';
            else if (lower.endsWith('.webm')) mimeType = 'video/webm';
            else if (lower.endsWith('.png')) mimeType = 'image/png';
            else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
            else if (lower.endsWith('.webp')) mimeType = 'image/webp';

            // Range request support for HTML5 video / audio streaming
            const range = req.headers.range;
            if (range) {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

              if (start >= fileSize) {
                res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
                res.end();
                return;
              }

              const chunkSize = (end - start) + 1;
              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=86400',
              });
              fs.createReadStream(filePath, { start, end }).pipe(res);
            } else {
              res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': mimeType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=86400',
              });
              fs.createReadStream(filePath).pipe(res);
            }
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

        // Helper to securely identify authenticated student and enforce isolation
        const getAuthenticatedStudentId = (req: any, fallbackParam?: string | null): string => {
          const authHeader = req.headers['authorization'] || '';
          if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7).trim();
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                // 1. Prioritize explicit numeric userId / id
                if (payload.userId && !isNaN(Number(payload.userId))) return String(payload.userId);
                if (payload.id && !isNaN(Number(payload.id))) return String(payload.id);
                // 2. Check if sub is numeric ID
                if (payload.sub && !isNaN(Number(payload.sub))) return String(payload.sub);
                // 3. Resolve by email from payload.sub or payload.email
                const email = payload.email || (payload.sub && payload.sub.includes('@') ? payload.sub : '');
                if (email) {
                  const resolved = db.getUserIdByEmail?.(email);
                  if (resolved) return String(resolved);
                }
              }
            } catch {}
          }

          const headerUser = req.headers['x-user-id'];
          if (headerUser && typeof headerUser === 'string' && headerUser.trim()) {
            const val = headerUser.trim();
            if (!isNaN(Number(val))) return val;
            const resolved = db.getUserIdByEmail?.(val);
            if (resolved) return String(resolved);
          }

          if (fallbackParam && typeof fallbackParam === 'string' && fallbackParam.trim()) {
            const val = fallbackParam.trim();
            if (!isNaN(Number(val))) return val;
            const resolved = db.getUserIdByEmail?.(val);
            if (resolved) return String(resolved);
          }

          return '20';
        };

        // 8. Learning Progress & Continue Learning APIs
        if ((pathname === '/api/v1/student/learning/continue' || pathname === '/api/v1/learning-progress/recent') && req.method === 'GET') {
          try {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const queryStudentId = parsedUrl.searchParams.get('studentId');
            // Authenticated token/header takes strict precedence to enforce student isolation
            const studentId = getAuthenticatedStudentId(req, queryStudentId);
            const limit = parseInt(parsedUrl.searchParams.get('limit') || '6', 10);

            const data = db.getRecentLearningProgress(studentId, limit);
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

        if (pathname === '/api/v1/learning-progress' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            // Derive student identity from auth token/headers to prevent tampering
            const studentId = getAuthenticatedStudentId(req, body.studentId);
            const data = db.saveLearningProgress({ ...body, studentId });
            res.statusCode = 200;
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

        if (pathname.startsWith('/api/v1/learning-progress/') && req.method === 'GET') {
          try {
            const contentId = pathname.replace('/api/v1/learning-progress/', '');
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const queryStudentId = parsedUrl.searchParams.get('studentId');
            const studentId = getAuthenticatedStudentId(req, queryStudentId);

            const data = db.getLearningProgressByContent(studentId, contentId);
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

        // 9. AI NCERT Available Chapters
        if (pathname === '/api/v1/ai/ncert/chapters' && req.method === 'GET') {
          try {
            const classGrade = Number(parsedUrl.searchParams.get('classGrade')) || 9;
            const subject = parsedUrl.searchParams.get('subject') || 'Mathematics';
            const data = db.getNcertAvailableChapters({ classGrade, subject });
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

        // 10. AI NCERT Quiz Generation
        if (pathname === '/api/v1/ai/quiz/generate' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const studentId = getAuthenticatedStudentId(req, body.studentId);
            const data = db.generateNcertQuiz({
              studentId,
              classGrade: body.classGrade || 9,
              subject: body.subject || 'Mathematics',
              chapter: body.chapter || 'Coordinate Geometry',
              difficulty: body.difficulty || 'medium',
              questionType: body.questionType || 'MCQ',
              count: body.count || 1,
            });
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 201, success: true, data }));
            return;
          } catch (err: any) {
            const isQuota = err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'));
            const status = isQuota ? 429 : 500;
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status,
              error: isQuota 
                ? 'NCERT AI generation daily quota reached. Please try again later.' 
                : (err.message || 'Failed to generate NCERT quiz')
            }));
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
