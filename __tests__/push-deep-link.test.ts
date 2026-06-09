import { routePushDeepLink } from '../features/notifications/utils/pushDeepLink';

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

const calls: string[] = [];

async function main() {
  await routePushDeepLink('runpack://sessions/session-1', {
    joinSession: async (sessionId) => {
      calls.push(`join:${sessionId}`);
      return {
        id: sessionId,
        groupId: 'group-1',
        groupName: 'Grupo 01',
        joinedAt: new Date(Date.now() - 1000).toISOString(),
        distanceGoalM: 5000,
      };
    },
    setSession: (sessionId, _joinedAt, isCreator, groupId, groupName, distanceGoalM) => {
      calls.push(`set:${sessionId}:${isCreator}:${groupId}:${groupName}:${distanceGoalM}`);
    },
    push: (href) => calls.push(`push:${href}`),
  });

  assertEqual(calls[0], 'join:session-1', 'Session notification should join session first');
  assertEqual(calls[1], 'set:session-1:false:group-1:Grupo 01:5000', 'Session notification should store joined session');
  assertEqual(calls[2], 'push:/(modal)/live-session', 'Session notification should open live session');
}

main().catch((error) => {
  console.error(error);
  throw error;
});
