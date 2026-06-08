import { useEffect, useRef } from 'react';
import * as Pedometer from 'expo-pedometer';
import { useSessionStore } from '@store/session.store';
import { useAuthStore } from '@store/auth.store';

const TELEMETRY_INTERVAL_MS = 5000;
const STRIDE_LENGTH_M = 0.762;

interface SendTelemetry {
  (payload: {
    sessionId: string;
    userId: string;
    elapsedMs: number;
    distanceM: number;
    paceSKm: number;
  }): void;
}

export function useTelemetry(sendTelemetry: SendTelemetry) {
  const sessionId = useSessionStore((s) => s.sessionId);
  const joinedAt = useSessionStore((s) => s.joinedAt);
  const updateTelemetry = useSessionStore((s) => s.updateTelemetry);
  const userId = useAuthStore((s) => s.user?.id);

  const stepsRef = useRef(0);
  const pedometerSub = useRef<Pedometer.Subscription | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId || !userId || !joinedAt) return;

    Pedometer.isAvailableAsync().then((available) => {
      if (available && typeof Pedometer.watchStepCount === 'function') {
        pedometerSub.current = Pedometer.watchStepCount(({ steps }) => {
          stepsRef.current = steps;
        });
      }
    });

    intervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - joinedAt;
      const distanceM = stepsRef.current * STRIDE_LENGTH_M;
      const paceSKm = distanceM > 0
        ? (elapsedMs / 1000) / (distanceM / 1000)
        : 0;

      updateTelemetry({ elapsedMs, distanceM, paceSKm });
      sendTelemetry({ sessionId, userId, elapsedMs, distanceM, paceSKm });
    }, TELEMETRY_INTERVAL_MS);

    return () => {
      pedometerSub.current?.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, userId, joinedAt]);
}
