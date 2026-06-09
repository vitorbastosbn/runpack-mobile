import { useLocalSearchParams } from 'expo-router';
import { RunDetailView } from '@features/history/components/RunDetailView';

export default function GroupRunDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <RunDetailView sessionId={sessionId} />;
}
