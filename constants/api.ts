import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';
import { resolveDevServerUrl } from './api-host';

const DEFAULT_API_URL = 'http://localhost:8080';
const DEFAULT_WS_URL = 'ws://localhost:8080/ws';

const DEV_SERVER_HOST =
  Platform.OS === 'android'
    ? Platform.constants.ServerHost ?? Constants.expoConfig?.hostUri
    : Constants.expoConfig?.hostUri;
const SCRIPT_URL = NativeModules.SourceCode?.scriptURL as string | undefined;

export const API_BASE_URL = resolveDevServerUrl(
  process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
  DEV_SERVER_HOST,
  SCRIPT_URL,
);

export const WS_BASE_URL = resolveDevServerUrl(
  process.env.EXPO_PUBLIC_WS_URL ?? DEFAULT_WS_URL,
  DEV_SERVER_HOST,
  SCRIPT_URL,
);

if (__DEV__) {
  console.log('[api-config]', {
    api: API_BASE_URL,
    ws: WS_BASE_URL,
    devServerHost: DEV_SERVER_HOST,
    scriptUrl: SCRIPT_URL,
  });
}

export const TELEMETRY_INTERVAL_MS = 5_000;
export const WS_OFFLINE_QUEUE_LIMIT = 12;

export const INVITE_EXPIRY = {
  group: 24 * 60 * 60 * 1000,    // 24h em ms
  session: 30 * 60 * 1000,        // 30min em ms
} as const;
