// lib/api.ts
import { API_BASE_URL } from '@/config/config';
import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const requestUrl = config.url || '';

      // Public endpoints that don't require authentication
      // Don't send token for these to avoid 401 errors with expired tokens
      const publicEndpoints = [
        '/properties',
        '/properties/featured',
        '/properties/filters',
      ];

      const optionalAuthEndpoints: RegExp[] = [];

      const isPublicEndpoint =
        requestUrl.match(/^\/properties\/[^\/]+$/) || // Single property by ID: /properties/:id
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

      // Add token for all protected endpoints (admin, dashboard, user-specific, etc.)
      // Only skip token for explicitly public endpoints
      // For optional auth endpoints, send token if available
      if (token) {
        // Admin endpoints always require authentication
        const isAdminEndpoint = requestUrl.startsWith('/admin');
        // Dashboard endpoints always require authentication
        const isDashboardEndpoint = requestUrl.includes('/dashboard') || requestUrl.includes('/my-');
        // User-specific endpoints always require authentication
        const isUserEndpoint = requestUrl.includes('/user/') || requestUrl.includes('/me');

        // Send token for:
        // 1. Admin endpoints (always required)
        // 2. Dashboard/user endpoints (always required)
        // 3. All other protected endpoints (not public endpoints)
        // 4. Optional auth endpoints (so users can see their own data)
        const shouldSendToken =
          isAdminEndpoint ||
          isDashboardEndpoint ||
          isUserEndpoint ||
          !isPublicEndpoint ||
          isOptionalAuthEndpoint;

        if (shouldSendToken) {
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // List of public endpoints that don't require authentication
        // These endpoints should work even with invalid/expired tokens
        const publicEndpoints = [
          '/properties',
          '/properties/featured',
          '/properties/filters',
        ];

        // Optional auth endpoints - work with or without token
        // If token is invalid, just retry without token (don't redirect)
        const optionalAuthEndpoints: RegExp[] = [];

        const requestUrl = error.config?.url || '';

        // Check if it's an optional auth endpoint
        const isOptionalAuthEndpoint = optionalAuthEndpoints.some(pattern =>
          pattern.test(requestUrl)
        );

        // Check if it's a public property endpoint (list, featured, filters, or single property by ID)
        // Exclude user-specific or dashboard endpoints
        const isPublicEndpoint =
          requestUrl.match(/^\/properties\/[^\/]+$/) || // Single property by ID: /properties/:id
          publicEndpoints.some(endpoint =>
            requestUrl.includes(endpoint) &&
            !requestUrl.includes('/user/') &&
            !requestUrl.includes('/dashboard') &&
            !requestUrl.includes('/my-properties') &&
            !requestUrl.includes('/favorite') &&
            !requestUrl.includes('/tour') &&
            !requestUrl.includes('/inquiry')
          );

        // Handle optional auth endpoints - retry without token if 401
        if (isOptionalAuthEndpoint && error.config && !error.config._retry) {
          // Remove token and retry the request
          error.config._retry = true;
          delete error.config.headers.Authorization;
          return api.request(error.config);
        }

        // Only redirect to login if it's NOT a public or optional auth endpoint
        // Public and optional auth endpoints should work without authentication
        if (!isPublicEndpoint && !isOptionalAuthEndpoint) {
          // Token is invalid or expired for protected endpoint
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          // For public/optional auth endpoints, just remove invalid token but don't redirect
          // This allows users to view properties even with expired tokens
          const token = localStorage.getItem('token');
          if (token) {
            // Only remove token if it's causing issues, but don't redirect
            // The request will work without token for public/optional auth endpoints
            try {
              // Clear token silently for public/optional auth endpoints
              localStorage.removeItem('token');
            } catch {
              // Ignore errors
            }
          }
        }
      }
    }
    return Promise.reject(error);
  }
);