import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { WS_BASE_URL } from '@constants/api';
import { useAuthStore } from '@store/auth.store';
import { useSessionStore } from '@store/session.store';
import { GROUPS_KEY } from '@features/groups/hooks/useGroups';
import { ACTIVE_RUNS_KEY } from './useActiveRuns';
import type { RankingEntry } from '../types';

const WS_URL = WS_BASE_URL;
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
  const queryClient = useQueryClient();
  const jwt = useAuthStore((s) => s.jwt);
  const userId = useAuthStore((s) => s.user?.id);
  const sessionId = useSessionStore((s) => s.sessionId);
  const setStatus = useSessionStore((s) => s.setStatus);
  const updateRanking = useSessionStore((s) => s.updateRanking);
  const setGoalCompleted = useSessionStore((s) => s.setGoalCompleted);

  // Refs so STOMP callbacks always read current values without stale closure issues
  const userIdRef = useRef(userId);
  const setGoalCompletedRef = useRef(setGoalCompleted);
  const updateRankingRef = useRef(updateRanking);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { setGoalCompletedRef.current = setGoalCompleted; }, [setGoalCompleted]);
  useEffect(() => { updateRankingRef.current = updateRanking; }, [updateRanking]);

  const clientRef = useRef<Client | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const offlineQueue = useRef<TelemetryPayload[]>([]);
  const [toasts, setToasts] = useState<string[]>([]);

  const addToast = useCallback((msg: string) => {
    setToasts((prev) => [...prev, msg]);
    const t = setTimeout(() => setToasts((prev) => prev.slice(1)), 3500);
    toastTimers.current.push(t);
  }, []);

  // Keep addToast in a ref so STOMP callbacks don't go stale
  const addToastRef = useRef(addToast);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);

  const connect = useCallback(() => {
    if (!jwt || !sessionId) return;

    setStatus('connecting');

    console.log('[WS-DBG] connect() called, url=', WS_URL, 'session=', sessionId);
    console.log('[WS-DBG] TextEncoder?', typeof TextEncoder, 'TextDecoder?', typeof TextDecoder);

    const client = new Client({
      webSocketFactory: () =>
        // Pass STOMP subprotocols so Spring routes the raw socket to its STOMP handler.
        new WebSocket(WS_URL, ['v12.stomp', 'v11.stomp', 'v10.stomp']) as unknown as globalThis.WebSocket,
      // React Native's WebSocket chops the trailing NULL byte that terminates STOMP frames,
      // so Spring's BufferingStompDecoder never completes the frame. Send frames as binary
      // (preserves NULL) and re-append NULL on incoming frames. This is the documented RN fix.
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      connectHeaders: { Authorization: `Bearer ${jwt}` },
      reconnectDelay: 0, // manual reconnect
      onConnect: () => {
        console.log('[WS-DBG] onConnect — STOMP connected, subscribing to session', sessionId);
        retryCount.current = 0;
        setStatus('connected');

        client.subscribe(`/topic/session/${sessionId}`, (frame) => {
          console.log('[WS-DBG] frame received:', frame.body?.slice(0, 200));
          try {
            const event = JSON.parse(frame.body) as { type: string; [key: string]: unknown };
            handleEventRef.current(event);
          } catch (e) {
            console.log('[WS-DBG] frame parse error', e);
          }
        });

        // Drain offline queue
        const queue = [...offlineQueue.current];
        offlineQueue.current = [];
        console.log('[WS-DBG] draining offline queue, size=', queue.length);
        queue.forEach((payload) => {
          client.publish({
            destination: `/app/session/${sessionId}/telemetry`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
        });
      },
      onDisconnect: () => { console.log('[WS-DBG] onDisconnect'); scheduleReconnectRef.current(); },
      onStompError: (f) => { console.log('[WS-DBG] onStompError', f.headers?.message, f.body); scheduleReconnectRef.current(); },
      onWebSocketError: (e) => { console.log('[WS-DBG] onWebSocketError', (e as { message?: string })?.message ?? e); scheduleReconnectRef.current(); },
      onWebSocketClose: (e) => { console.log('[WS-DBG] onWebSocketClose code=', (e as { code?: number })?.code, 'reason=', (e as { reason?: string })?.reason); },
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
      connectRef.current();
    }, delay);
  }, []);

  // Keep connect and scheduleReconnect in refs so callbacks don't go stale
  const connectRef = useRef(connect);
  const scheduleReconnectRef = useRef(scheduleReconnect);
  useEffect(() => { connectRef.current = connect; }, [connect]);
  useEffect(() => { scheduleReconnectRef.current = scheduleReconnect; }, [scheduleReconnect]);

  const handleEvent = useCallback((event: { type: string; [key: string]: unknown }) => {
    switch (event.type) {
      case 'ranking_update':
        updateRankingRef.current(event.rankings as RankingEntry[]);
        break;
      case 'participant_completed':
        if (event.userId === userIdRef.current) {
          setGoalCompletedRef.current();
        }
        addToastRef.current(`${event.username} completou a meta! 🏁`);
        break;
      case 'participant_joined':
        addToastRef.current(`${event.username} entrou na corrida`);
        break;
      case 'participant_left':
        addToastRef.current(`${event.username} saiu`);
        break;
      case 'session_finished':
        // Run ended — drop it from home's "corridas em andamento".
        queryClient.invalidateQueries({ queryKey: ACTIVE_RUNS_KEY });
        queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
        router.replace('/(modal)/run-summary');
        break;
    }
  }, [router, queryClient]);

  const handleEventRef = useRef(handleEvent);
  useEffect(() => { handleEventRef.current = handleEvent; }, [handleEvent]);

  useEffect(() => {
    connectRef.current();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      toastTimers.current.forEach(clearTimeout);
      toastTimers.current = [];
      clientRef.current?.deactivate();
    };
  }, []);

  const sendTelemetry = useCallback((payload: TelemetryPayload) => {
    const client = clientRef.current;
    if (client?.connected) {
      console.log('[WS-DBG] sendTelemetry PUBLISH distanceM=', payload.distanceM);
      client.publish({
        destination: `/app/session/${sessionId}/telemetry`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      console.log('[WS-DBG] sendTelemetry QUEUED (not connected) distanceM=', payload.distanceM);
      if (offlineQueue.current.length >= MAX_OFFLINE_QUEUE) {
        offlineQueue.current.shift();
      }
      offlineQueue.current.push(payload);
    }
  }, [sessionId]);

  const reconnect = useCallback(() => {
    retryCount.current = 0;
    connectRef.current();
  }, []);

  return { sendTelemetry, reconnect, toasts };
}
