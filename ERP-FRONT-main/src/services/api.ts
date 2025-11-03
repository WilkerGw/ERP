import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  // --- MUDANÇA AQUI ---
  // Agora a URL base vem da nossa variável de ambiente
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor (continua o mesmo)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;