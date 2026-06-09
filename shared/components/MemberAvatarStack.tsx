import { View, Image, Text } from 'react-native';
import type { GroupMember } from '@features/groups/types';

interface MemberAvatarStackProps {
  /** Already sliced to the visible subset. */
  members: GroupMember[];
  /** Total group member count — used to compute the "+N" overflow badge. */
  totalCount: number;
  /** Ring color, matched to the card background it sits on. */
  borderColor: string;
  size?: number;
}

export function MemberAvatarStack({
  members,
  totalCount,
  borderColor,
  size = 24,
}: MemberAvatarStackProps) {
  const overflow = totalCount - members.length;
  const radius = size / 2;
  const overlap = -Math.round(size / 3);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {members.map((member, i) => (
        <View
          key={member.userId}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: 1.5,
            borderColor,
            marginLeft: i > 0 ? overlap : 0,
            zIndex: members.length - i,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
        >
          {member.avatarUrl ? (
            <Image source={{ uri: member.avatarUrl }} style={{ width: size, height: size, borderRadius: radius }} />
          ) : (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: radius,
                backgroundColor: 'rgba(255,255,255,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: Math.round(size * 0.38), fontWeight: '700' }}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderWidth: 1.5,
            borderColor,
            marginLeft: overlap,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: Math.round(size * 0.33), fontWeight: '700' }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
