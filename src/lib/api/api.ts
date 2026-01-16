
import { API_BASE_URL } from '@/config/config';
import axios from 'axios';


export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const requestUrl = config.url || '';



      const publicEndpoints = [
        '/properties',
        '/properties/featured',
        '/properties/filters',
      ];

      const optionalAuthEndpoints: RegExp[] = [
        /^\/properties/,
      ];

      const isPublicEndpoint =
        requestUrl.match(/^\/properties\/[^\/]+$/) ||
        publicEndpoints.some(endpoint =>
          requestUrl.includes(endpoint) &&
          !requestUrl.includes('/user/') &&
          !requestUrl.includes('/dashboard') &&
          !requestUrl.includes('/my-properties') &&
          !requestUrl.includes('/favorite') &&
          !requestUrl.includes('/tour') &&
          !requestUrl.includes('/inquiry')
        );

      const isOptionalAuthEndpoint = optionalAuthEndpoints.some(pattern =>
        pattern.test(requestUrl)
      );




      if (token) {

        const isAdminEndpoint = requestUrl.startsWith('/admin');

        const isDashboardEndpoint = requestUrl.includes('/dashboard') || requestUrl.includes('/my-');

        const isUserEndpoint = requestUrl.includes('/user/') || requestUrl.includes('/me');






        const shouldSendToken =
          isAdminEndpoint ||
          isDashboardEndpoint ||
          isUserEndpoint ||
          !isPublicEndpoint ||
          isOptionalAuthEndpoint;

        if (shouldSendToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // Define patterns for Public and Optional Auth endpoints
      const publicEndpoints = ['/properties', '/properties/featured', '/properties/filters'];
      const optionalAuthPatterns = [/^\/properties/];

      const isPublic = publicEndpoints.some(ep => requestUrl.includes(ep)) || requestUrl.match(/^\/properties\/[^\/]+$/);
      const isOptional = optionalAuthPatterns.some(p => p.test(requestUrl));

      const isIgnored = isPublic || isOptional;

      // Clear persistent storage only if we strictly need to
      if (!isIgnored) {
        console.error(`[API Interceptor] 401 Unauth from ${requestUrl}. Clearing session.`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Check if current page is protected
      const currentPath = window.location.pathname;
      const isProtectedPage =
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/profile');

      if (isProtectedPage && !isIgnored) {
        // Force redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);