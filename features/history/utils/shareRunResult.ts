import { formatDistance, formatDuration, formatPace } from '@shared/utils/format';

export type ShareRunParticipant = {
  userId: string;
  name?: string;
  username?: string;
  totalDistanceM: number;
  totalTimeMs: number;
  avgPaceSkm?: number;
  finalRank: number;
};

export type ShareRunCardInput = {
  title?: string | null;
  startedAt?: string | null;
  myResult: ShareRunParticipant;
  participants: ShareRunParticipant[];
};

export type ShareRunCardParticipantModel = {
  userId: string;
  name: string;
  distanceLabel: string;
  rankLabel: string;
};

export type ShareRunCardModel = {
  footer: string;
  title: string;
  dateLabel?: string;
  runnerName: string;
  headline: string;
  rankLabel: string;
  distanceLabel: string;
  timeLabel: string;
  paceLabel: string;
  topParticipants: ShareRunCardParticipantModel[];
};

function displayName(participant: Pick<ShareRunParticipant, 'name' | 'username'>): string {
  return participant.name?.trim() || participant.username?.trim() || 'Runner';
}

function formatDateLabel(startedAt?: string | null): string | undefined {
  if (!startedAt) return undefined;
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatHashRank(rank: number): string {
  return `#${rank}`;
}

function createHeadline(rank: number): string {
  if (rank === 1) return 'Mandou no pace e levou o topo';
  if (rank <= 3) return 'Subiu no pódio da corrida';
  return 'Mais uma corrida para a conta';
}

export function buildShareRunCardModel(input: ShareRunCardInput): ShareRunCardModel {
  const participants = input.participants.length > 0 ? input.participants : [input.myResult];
  const sortedParticipants = [...participants].sort((a, b) => a.finalRank - b.finalRank);

  return {
    footer: 'RunPack',
    title: input.title?.trim() || 'Corrida livre',
    dateLabel: formatDateLabel(input.startedAt),
    runnerName: displayName(input.myResult),
    headline: createHeadline(input.myResult.finalRank),
    rankLabel: `${formatHashRank(input.myResult.finalRank)} de ${participants.length}`,
    distanceLabel: formatDistance(input.myResult.totalDistanceM),
    timeLabel: formatDuration(input.myResult.totalTimeMs),
    paceLabel: formatPace(input.myResult.avgPaceSkm ?? 0),
    topParticipants: sortedParticipants.slice(0, 3).map((participant) => ({
      userId: participant.userId,
      name: displayName(participant),
      distanceLabel: formatDistance(participant.totalDistanceM),
      rankLabel: formatHashRank(participant.finalRank),
    })),
  };
}
