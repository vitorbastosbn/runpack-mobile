export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws';

export const TELEMETRY_INTERVAL_MS = 5_000;
export const WS_OFFLINE_QUEUE_LIMIT = 12;

export const INVITE_EXPIRY = {
  group: 24 * 60 * 60 * 1000,    // 24h em ms
  session: 30 * 60 * 1000,        // 30min em ms
} as const;
