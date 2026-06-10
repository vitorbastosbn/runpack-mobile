import { buildShareRunCardModel } from '../features/history/utils/shareRunResult';

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

const model = buildShareRunCardModel({
  title: 'Grupo pace forte',
  startedAt: '2026-06-10T10:30:00.000Z',
  myResult: {
    userId: 'user-2',
    name: 'Vitor Bueno',
    username: 'vitor',
    totalDistanceM: 5120,
    totalTimeMs: 31 * 60 * 1000 + 22 * 1000,
    avgPaceSkm: 368,
    finalRank: 2,
  },
  participants: [
    {
      userId: 'user-2',
      name: 'Vitor Bueno',
      username: 'vitor',
      totalDistanceM: 5120,
      totalTimeMs: 31 * 60 * 1000 + 22 * 1000,
      avgPaceSkm: 368,
      finalRank: 2,
    },
    {
      userId: 'user-1',
      name: 'Ana Silva',
      username: 'ana',
      totalDistanceM: 5340,
      totalTimeMs: 31 * 60 * 1000,
      avgPaceSkm: 348,
      finalRank: 1,
    },
    {
      userId: 'user-3',
      name: 'Caio',
      username: 'caio',
      totalDistanceM: 4980,
      totalTimeMs: 32 * 60 * 1000,
      avgPaceSkm: 386,
      finalRank: 3,
    },
    {
      userId: 'user-4',
      name: 'Lia',
      username: 'lia',
      totalDistanceM: 4200,
      totalTimeMs: 31 * 60 * 1000,
      avgPaceSkm: 443,
      finalRank: 4,
    },
  ],
});

assertEqual(model.footer, 'RunPack', 'Share card should carry app name in the footer');
assertEqual(model.runnerName, 'Vitor Bueno', 'Share card should prefer display name');
assertEqual(model.rankLabel, '#2 de 4', 'Share card should show my position out of participants');
assertEqual(model.distanceLabel, '5.12 km', 'Share card should format distance');
assertEqual(model.timeLabel, '31:22', 'Share card should format duration');
assertEqual(model.paceLabel, '6:08 /km', 'Share card should format pace');
assertEqual(model.topParticipants.length, 3, 'Share card should only show top 3 participants');
assertEqual(model.topParticipants[0]?.name, 'Ana Silva', 'Share card podium should be sorted by final rank');
assertEqual(model.topParticipants[2]?.rankLabel, '#3', 'Share card podium rank should use hash labels');
