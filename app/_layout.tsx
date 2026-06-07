import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@store/auth.store';
import { queryClient } from '@shared/utils/queryClient';

export default function RootLayout() {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // Verificar JWT salvo ao abrir o app
    SecureStore.getItemAsync('runpack_jwt').then((jwt) => {
      if (jwt) {
        // TODO: validar JWT e carregar user — por ora apenas hidrata
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modal)" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="invite/[token]" />
        <Stack.Screen name="invite/invalid" />
        <Stack.Screen name="achievements" />
      </Stack>
    </QueryClientProvider>
  );
}
