import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@constants/api';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const jwt = await SecureStore.getItemAsync('runpack_jwt');
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('runpack_jwt');
      // Zustand clearAuth será chamado pelo listener de 401 na camada de feature
    }
    return Promise.reject(error);
  },
);
