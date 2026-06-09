import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useSessionStore } from '@store/session.store';
import { useAuthStore } from '@store/auth.store';

const TELEMETRY_INTERVAL_MS = 5000;

// DEV testing on emulator: GPS is static so distance never accumulates and the
// distance goal can't be reached. Set EXPO_PUBLIC_SIMULATE_DISTANCE to meters-per-tick
// (e.g. "150") to fake forward motion. Unset/0 in production = real GPS only.
const SIMULATE_DISTANCE_PER_TICK = Number(process.env.EXPO_PUBLIC_SIMULATE_DISTANCE ?? 0);

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const goalCompleted = useSessionStore((s) => s.goalCompleted);
  const updateTelemetry = useSessionStore((s) => s.updateTelemetry);
  const userId = useAuthStore((s) => s.user?.id);

  // Ref so the interval callback always reads the latest value without re-running effect
  const goalCompletedRef = useRef(goalCompleted);
  useEffect(() => {
    goalCompletedRef.current = goalCompleted;
  }, [goalCompleted]);

  const distanceRef = useRef(0);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId || !userId || !joinedAt) return;

    distanceRef.current = 0;
    lastPositionRef.current = null;

    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          // Stop accumulating distance once goal is completed
          if (goalCompletedRef.current) return;

          const { latitude, longitude } = loc.coords;
          if (lastPositionRef.current) {
            const delta = haversineDistance(
              lastPositionRef.current.lat,
              lastPositionRef.current.lon,
              latitude,
              longitude,
            );
            // Ignore jitter < 1m (GPS noise)
            if (delta >= 1) {
              distanceRef.current += delta;
            }
          }
          lastPositionRef.current = { lat: latitude, lon: longitude };
        },
      ).then((sub) => {
        locationSubRef.current = sub;
      });
    });

    intervalRef.current = setInterval(() => {
      // Stop sending telemetry once goal is completed (server already registered completion)
      if (goalCompletedRef.current) return;

      // DEV: fake forward motion on emulator (no GPS movement)
      if (SIMULATE_DISTANCE_PER_TICK > 0) {
        distanceRef.current += SIMULATE_DISTANCE_PER_TICK;
      }

      const elapsedMs = Date.now() - joinedAt;
      const distanceM = distanceRef.current;
      const paceSKm =
        distanceM > 0 ? (elapsedMs / 1000) / (distanceM / 1000) : 0;

      updateTelemetry({ elapsedMs, distanceM, paceSKm });
      sendTelemetry({ sessionId, userId, elapsedMs, distanceM, paceSKm });
    }, TELEMETRY_INTERVAL_MS);

    return () => {
      if (!goalCompletedRef.current) {
        const elapsedMs = Date.now() - joinedAt;
        const distanceM = distanceRef.current;
        const paceSKm =
          distanceM > 0 ? (elapsedMs / 1000) / (distanceM / 1000) : 0;
        updateTelemetry({ elapsedMs, distanceM, paceSKm });
      }

      locationSubRef.current?.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, userId, joinedAt]);
}
