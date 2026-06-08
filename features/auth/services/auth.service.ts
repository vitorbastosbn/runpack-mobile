import { http } from '@shared/utils/http';
import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'runpack_jwt';

export interface AuthResponse {
  jwt: string;
  isNewUser: boolean;
  userId: string;
  email: string;
  username: string | null;
}

export const authService = {
  async socialLogin(provider: 'google', idToken: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/social', { provider, idToken });
    return data;
  },

  async saveJwt(jwt: string): Promise<void> {
    await SecureStore.setItemAsync(JWT_KEY, jwt);
  },

  async getJwt(): Promise<string | null> {
    return SecureStore.getItemAsync(JWT_KEY);
  },

  async clearJwt(): Promise<void> {
    await SecureStore.deleteItemAsync(JWT_KEY);
  },
};
