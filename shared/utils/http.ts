import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@constants/api';

type PremiumErrorListener = (code: string) => void;
let premiumErrorListener: PremiumErrorListener | null = null;

/** Registrado pela feature de subscription — abre a Paywall em erros 403 premium. */
export function setPremiumErrorListener(listener: PremiumErrorListener | null) {
  premiumErrorListener = listener;
}

const PREMIUM_ERROR_CODES = new Set(['GROUP_LIMIT_REACHED', 'SESSION_LIMIT_REACHED', 'PREMIUM_REQUIRED']);

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
    if (axios.isAxiosError(error) && error.response) {
      const method = error.config?.method?.toUpperCase() ?? 'HTTP';
      const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
      const body = error.response.data;
      const message =
        body && typeof body === 'object' && 'message' in body
          ? String(body.message)
          : error.message;

      console.warn('[api]', method, url, error.response.status, message);
    }

    const premiumCode = error.response?.data?.code;
    if (typeof premiumCode === 'string' && PREMIUM_ERROR_CODES.has(premiumCode)) {
      premiumErrorListener?.(premiumCode);
    }

    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('runpack_jwt');
      // Zustand clearAuth será chamado pelo listener de 401 na camada de feature
    }
    return Promise.reject(error);
  },
);
