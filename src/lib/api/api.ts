
import { API_BASE_URL } from '@/config/config';
import axios from 'axios';


export const api = axios.create({
  baseURL: API_BASE_URL,
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


api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        
        
        const publicEndpoints = [
          '/properties',
          '/properties/featured',
          '/properties/filters',
        ];

        
        
        const optionalAuthEndpoints: RegExp[] = [
          /^\/properties/, 
        ];

        const requestUrl = error.config?.url || '';

        
        const isOptionalAuthEndpoint = optionalAuthEndpoints.some(pattern =>
          pattern.test(requestUrl)
        );

        
        
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

        
        if (isOptionalAuthEndpoint && error.config && !error.config._retry) {
          
          error.config._retry = true;
          delete error.config.headers.Authorization;
          return api.request(error.config);
        }

        
        
        if (!isPublicEndpoint && !isOptionalAuthEndpoint) {
          
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          
          
          const token = localStorage.getItem('token');
          if (token) {
            
            
            try {
              
              localStorage.removeItem('token');
            } catch {
              
            }
          }
        }
      }
    }
    return Promise.reject(error);
  }
);