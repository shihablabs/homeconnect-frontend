
import { API_BASE_URL } from '@/config/config';
import axios from 'axios';


export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
});


uploadApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export const uploadService = {
  uploadImage: async (file: File, folder: string = 'bookings'): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await uploadApi.post('/upload/image', formData);
    return response.data.data;
  },
};

export default uploadApi;