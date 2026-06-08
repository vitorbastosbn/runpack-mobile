import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/auth.store';
import { useSessionStore } from '@store/session.store';
import type { RankingEntry, WsStatus } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://10.0.2.2:8080/ws';
const MAX_RETRIES = 5;
const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000];
const MAX_OFFLINE_QUEUE = 12;

interface TelemetryPayload {
  sessionId: string;
  userId: string;
  elapsedMs: number;
  distanceM: number;
  paceSKm: number;
}

export function useLiveSession() {
  const router = useRouter();
  const jwt = useAuthStore((s) => s.jwt);
  const userId = useAuthStore((s) => s.user?.id);
  const sessionId = useSessionStore((s) => s.sessionId);
  const setStatus = useSessionStore((s) => s.setStatus);
  const updateRanking = useSessionStore((s) => s.updateRanking);
  const clearSession = useSessionStore((s) => s.clearSession);

  const clientRef = useRef<Client | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offlineQueue = useRef<TelemetryPayload[]>([]);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; from: string }[]>([]);
  const [toasts, setToasts] = useState<string[]>([]);

  const addToast = (msg: string) => {
    setToasts((prev) => [...prev, msg]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 3000);
  };

  const connect = useCallback(() => {
    if (!jwt || !sessionId) return;

    setStatus('connecting');

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${jwt}` },
      reconnectDelay: 0, // manual reconnect
      onConnect: () => {
        retryCount.current = 0;
        setStatus('connected');

        client.subscribe(`/topic/session/${sessionId}`, (frame) => {
          try {
            const event = JSON.parse(frame.body);
            handleEvent(event);
          } catch {}
        });

        // Drain offline queue
        const queue = [...offlineQueue.current];
        offlineQueue.current = [];
        queue.forEach((payload) => {
          client.publish({
            destination: `/app/session/${sessionId}/telemetry`,
            body: JSON.stringify(payload),
          });
        });
      },
      onDisconnect: () => {
        scheduleReconnect();
      },
      onStompError: () => {
        scheduleReconnect();
      },
      onWebSocketError: () => {
        scheduleReconnect();
      },
    });

    client.activate();
    clientRef.current = client;
  }, [jwt, sessionId]);

  const scheduleReconnect = useCallback(() => {
    if (retryCount.current >= MAX_RETRIES) {
      setStatus('error');
      return;
    }
    setStatus('reconnecting');
    const delay = BACKOFF_DELAYS[retryCount.current] + Math.random() * 500;
    retryCount.current += 1;
    retryTimer.current = setTimeout(() => {
      clientRef.current?.deactivate();
      connect();
    }, delay);
  }, [connect]);

  const handleEvent = (event: { type: string; [key: string]: unknown }) => {
    switch (event.type) {
      case 'ranking_update':
        updateRanking(event.rankings as RankingEntry[]);
        break;
      case 'reaction':
        setReactions((prev) => {
          const id = Math.random().toString(36).slice(2);
          const next = [...prev, { id, emoji: event.emoji as string, from: event.fromUsername as string }];
          setTimeout(() => {
            setReactions((r) => r.filter((x) => x.id !== id));
          }, 2500);
          return next;
        });
        break;
      case 'participant_joined':
        addToast(`${event.username} entrou na corrida`);
        break;
      case 'participant_left':
        addToast(`${event.username} saiu`);
        break;
      case 'session_finished':
        clearSession();
        router.replace('/(modal)/run-summary');
        break;
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      clientRef.current?.deactivate();
    };
  }, []);

  const sendTelemetry = useCallback((payload: TelemetryPayload) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({
        destination: `/app/session/${sessionId}/telemetry`,
        body: JSON.stringify(payload),
      });
    } else {
      // Add to offline queue, drop oldest if full
      if (offlineQueue.current.length >= MAX_OFFLINE_QUEUE) {
        offlineQueue.current.shift();
      }
      offlineQueue.current.push(payload);
    }
  }, [sessionId]);

  const sendReaction = useCallback((emoji: string) => {
    const client = clientRef.current;
    if (!client?.connected || !sessionId) return;
    client.publish({
      destination: `/app/session/${sessionId}/reaction`,
      body: JSON.stringify({ emoji }),
    });
  }, [sessionId]);

  const reconnect = useCallback(() => {
    retryCount.current = 0;
    connect();
  }, [connect]);

  return { sendTelemetry, sendReaction, reconnect, reactions, toasts };
}
