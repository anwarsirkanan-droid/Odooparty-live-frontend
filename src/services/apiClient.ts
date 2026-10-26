import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const TOKEN_STORAGE_KEY = 'meso_token';

/**
 * Custom event name dispatched when a 401 Unauthorized response is received.
 */
export const AUTH_UNAUTHORIZED_EVENT = 'meso:unauthorized';

/**
 * Axios API client instance with:
 * - Base URL '/api'
 * - Request interceptor adding Bearer token from localStorage
 * - Response interceptor handling 401 unauthorized responses and clearing stale tokens
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // localStorage may fail in restricted sandbox environments
      console.warn('Failed to read auth token from localStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manage 401 Unauthorized responses & error formatting
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized
      if (status === 401) {
        try {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem('token');
        } catch (e) {
          // ignore storage error
        }

        // Notify app components (e.g. AuthContext) about expired or unauthorized session
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(AUTH_UNAUTHORIZED_EVENT, {
              detail: {
                message: data?.error || data?.message || 'Session expired or unauthorized. Please log in again.',
                status: 401,
              },
            })
          );
        }
      }

      // Extract user-friendly error message
      const errorMsg = data?.error || data?.message || (typeof data === 'string' ? data : `Request failed with status ${status}`);
      const customError: any = new Error(errorMsg);
      customError.status = status;
      customError.data = data;
      customError.isAxiosError = true;
      return Promise.reject(customError);
    } else if (error.request) {
      const networkError: any = new Error('Network error. Unable to reach OdooParty servers.');
      networkError.status = 0;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
