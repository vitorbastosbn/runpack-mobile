import { View, Text, Image } from 'react-native';

interface Props {
  name: string;
  avatarUrl: string | null | undefined;
  size?: number;
}

export function Avatar({ name, avatarUrl, size = 40 }: Props) {
  const initials = name?.charAt(0)?.toUpperCase() ?? '?';
  const fontSize = size * 0.35;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-surface-elevated items-center justify-center"
    >
      <Text style={{ fontSize }} className="text-text-secondary font-bold">
        {initials}
      </Text>
    </View>
  );
}
