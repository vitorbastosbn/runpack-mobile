import { useLocalSearchParams } from 'expo-router';
import { PublicProfileView } from '@features/profile/components/PublicProfileView';

export default function FriendProfileScreen() {
  const { id, friendshipId, favorite } = useLocalSearchParams<{
    id: string;
    friendshipId?: string;
    favorite?: string;
  }>();
  return <PublicProfileView id={id} friendshipId={friendshipId} favorite={favorite} />;
}
