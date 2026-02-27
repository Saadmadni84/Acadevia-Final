/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_GA_TRACKING_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_ENABLE_SOUNDS: string;
  readonly VITE_ENABLE_OFFLINE: string;
  readonly VITE_MAX_DOWNLOAD_SIZE_MB: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
