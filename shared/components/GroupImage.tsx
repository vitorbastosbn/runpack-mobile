import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { groupGradient } from '@shared/utils/groupColors';

interface GroupImageProps {
  groupId: string;
  imageUrl?: string | null;
  size: number;
  radius?: number;
}

/**
 * Imagem do grupo: foto quando existir, senão arte padrão de desafio —
 * gradiente identitário do grupo + corredor + wordmark RunPack.
 */
export function GroupImage({ groupId, imageUrl, size, radius = size * 0.33 }: GroupImageProps) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const showWordmark = size >= 44;
  const iconSize = Math.round(size * (showWordmark ? 0.4 : 0.5));
  const wordmarkSize = Math.max(6, Math.round(size * 0.105));

  return (
    <LinearGradient
      colors={groupGradient(groupId)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Eco do corredor ao fundo — profundidade sem ruído */}
      <View
        style={{
          position: 'absolute',
          right: -size * 0.18,
          bottom: -size * 0.12,
          opacity: 0.18,
        }}
      >
        <Ionicons name="walk" size={Math.round(size * 0.9)} color="#fff" />
      </View>

      <Ionicons name="walk" size={iconSize} color="#fff" />
      {showWordmark && (
        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: wordmarkSize,
            fontWeight: '800',
            letterSpacing: wordmarkSize * 0.18,
            marginTop: size * 0.045,
          }}
        >
          RUNPACK
        </Text>
      )}
    </LinearGradient>
  );
}
