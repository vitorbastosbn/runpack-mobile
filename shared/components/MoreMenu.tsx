import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export interface MoreMenuItem {
  label: string;
  icon: IoniconsName;
  destructive?: boolean;
  onPress: () => void;
}

interface MoreMenuProps {
  items: MoreMenuItem[];
  /** Lado do gatilho em px. */
  size?: number;
  /** Formato do gatilho — casa com o contexto (pill bar usa xl, headers usam full). */
  shape?: 'full' | 'xl';
  loading?: boolean;
  accessibilityLabel?: string;
}

/**
 * Botão "..." padrão: abre dropdown ancorado ao gatilho.
 * Única forma permitida de menu de contexto — nunca usar Alert como menu.
 */
export function MoreMenu({
  items,
  size = 36,
  shape = 'xl',
  loading,
  accessibilityLabel = 'Mais opções',
}: MoreMenuProps) {
  const triggerRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width;
      setMenuPos({
        top: y + height + 8,
        right: Math.max(12, screenWidth - (x + width)),
      });
    });
  };

  const closeMenu = () => setMenuPos(null);

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={openMenu}
        disabled={loading}
        activeOpacity={0.8}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={`bg-surface-card items-center justify-center ${
          shape === 'full' ? 'rounded-full' : 'rounded-xl'
        }`}
        style={{ width: size, height: size }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text.secondary} />
        ) : (
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
        )}
      </TouchableOpacity>

      <Modal visible={menuPos != null} transparent animationType="fade" onRequestClose={closeMenu}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeMenu}>
          <View
            style={{
              position: 'absolute',
              top: menuPos?.top ?? 0,
              right: menuPos?.right ?? 12,
              backgroundColor: colors.surface.elevated,
              borderRadius: 18,
              overflow: 'hidden',
              minWidth: 220,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {items.map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={{ height: 0.5, backgroundColor: colors.surface.border }} />}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                  onPress={() => {
                    closeMenu();
                    item.onPress();
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.destructive ? colors.status.error : colors.text.primary}
                  />
                  <Text
                    style={{
                      color: item.destructive ? colors.status.error : colors.text.primary,
                      fontSize: 15,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
