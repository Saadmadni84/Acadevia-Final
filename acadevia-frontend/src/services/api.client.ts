import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, user } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (user?.id) {
    config.headers['X-User-Id'] = user.id;
  }
  if (user?.role) {
    config.headers['X-User-Role'] = user.role;
  }
  const lang = localStorage.getItem('i18nextLng') || 'en';
  config.headers['Accept-Language'] = lang;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const { accessToken, refreshToken } = useAuthStore.getState();
    const isDemoSession =
      accessToken?.startsWith('demo-') ||
      refreshToken?.startsWith('demo-') ||
      accessToken === 'demo-token';

    const isLoginEndpoint = originalRequest.url?.includes('/api/v1/auth/login');
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginEndpoint) {
      // Demo accounts operate locally/mocked; never trigger backend refresh or evict demo session
      if (isDemoSession) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth/refresh-token`,
          { refreshToken }
        );
        const tokenData = data.data ?? data;
        useAuthStore.getState().setTokens(tokenData.accessToken, tokenData.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // Only logout if the refresh token itself was explicitly rejected (401)
        // Don't logout for network errors, 500s, or missing refresh endpoints
        console.warn('[api.client] Refresh failed:', refreshError?.response?.status, refreshError?.message);
        if (refreshError?.response?.status === 401 && !isDemoSession) {
          console.warn('[api.client] LOGOUT triggered by 401 on refresh');
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
