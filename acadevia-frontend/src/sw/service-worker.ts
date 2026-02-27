/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// ── Precache static assets ──────────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);

// ── API calls: NetworkFirst ─────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  }),
);

// ── Images: CacheFirst (30-day expiry) ──────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
);

// ── Fonts: CacheFirst (1-year expiry) ───────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  }),
);

// ── Background sync for failed POST/PUT ─────────────────────────────
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations-queue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
});

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') &&
    (request.method === 'POST' || request.method === 'PUT'),
  new NetworkFirst({
    cacheName: 'api-mutations',
    plugins: [bgSyncPlugin],
  }),
  'POST',
);

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') &&
    (request.method === 'POST' || request.method === 'PUT'),
  new NetworkFirst({
    cacheName: 'api-mutations',
    plugins: [bgSyncPlugin],
  }),
  'PUT',
);

// ── Push notification handler ───────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};

  const title: string = data.title ?? 'Acadevia';
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: data.icon ?? '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    tag: data.tag ?? 'default',
    data: {
      url: data.url ?? '/',
    },
    actions: data.actions ?? [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url: string = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url === url);
      if (existing) {
        return existing.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});

// ── Activate: claim clients immediately ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
