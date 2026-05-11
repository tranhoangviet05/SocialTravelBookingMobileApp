import axios from 'axios';
import { auth } from '@/src/api/firebase';

// Äá»‹a chá»‰ IP cá»§a mÃ¡y local cháº¡y Laravel
export const IP_LAN = '192.168.1.17';
export const BASE_URL = `http://${IP_LAN}:8000`;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 20000,
});

// Request Interceptor: Tá»± Ä‘á»™ng gáº¯n Token vÃ o má»—i yÃªu cáº§u
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('API Client: Error getting token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xá»­ lÃ½ lá»—i táº­p trung
    if (error.response?.status === 401) {
      console.log('Unauthorized - Redirecting to login...');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

