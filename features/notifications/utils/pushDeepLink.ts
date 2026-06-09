interface PushSessionItem {
  id: string;
  groupId: string | null;
  groupName: string | null;
  joinedAt: string;
  distanceGoalM: number | null;
}

interface PushDeepLinkDeps {
  joinSession: (sessionId: string) => Promise<PushSessionItem>;
  setSession: (
    sessionId: string,
    joinedAt: number,
    isCreator: boolean,
    groupId?: string | null,
    groupName?: string | null,
    distanceGoalM?: number | null,
  ) => void;
  push: (href: string) => void;
}

function clampJoinedAt(serverIso?: string): number {
  const serverMs = serverIso ? new Date(serverIso).getTime() : Date.now();
  return Math.min(serverMs, Date.now());
}

export async function routePushDeepLink(url: string, deps: PushDeepLinkDeps) {
  const path = url.replace('runpack://', '');

  if (path.startsWith('invite/')) {
    deps.push(`/invite/${path.slice(7)}`);
    return;
  }

  if (path.startsWith('sessions/')) {
    const sessionId = path.slice(9);
    const session = await deps.joinSession(sessionId);
    deps.setSession(
      session.id,
      clampJoinedAt(session.joinedAt),
      false,
      session.groupId,
      session.groupName,
      session.distanceGoalM,
    );
    deps.push('/(modal)/live-session');
    return;
  }

  if (path.startsWith('groups/')) {
    deps.push(`/(tabs)/groups/${path.slice(7)}`);
  } else if (path.startsWith('runs/')) {
    deps.push(`/(tabs)/history/${path.slice(5)}`);
  } else if (path === 'friends/requests') {
    deps.push('/(tabs)/friends/requests');
  } else if (path === 'friends') {
    deps.push('/(tabs)/friends');
  } else if (path === 'achievements') {
    deps.push('/achievements');
  }
}
