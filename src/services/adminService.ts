import { getAuthToken } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const clearCache = async (): Promise<any> => {
  const token = getAuthToken();
  const response = await axios.post(`${API_URL}/admin/cache/clear`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
