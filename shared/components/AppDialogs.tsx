import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

/* ----------------------------------- API ----------------------------------- */

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface ActionSheetItem {
  label: string;
  icon: IoniconsName;
  destructive?: boolean;
  onPress: () => void;
}

export interface ActionSheetOptions {
  title?: string;
  items: ActionSheetItem[];
}

export type ToastType = 'success' | 'error' | 'info';

interface DialogApi {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  actionSheet: (opts: ActionSheetOptions) => void;
  toast: (message: string, type: ToastType) => void;
}

let api: DialogApi | null = null;

/** Confirmação padrão (bottom sheet). Substitui Alert — Alert é proibido no app. */
export function confirmAction(opts: ConfirmOptions): Promise<boolean> {
  return api ? api.confirm(opts) : Promise.resolve(false);
}

/** Lista de ações (bottom sheet). */
export function showActionSheet(opts: ActionSheetOptions): void {
  api?.actionSheet(opts);
}

/** Notificação in-app — pílula no topo, some sozinha. */
export function showToast(message: string, type: ToastType = 'info'): void {
  api?.toast(message, type);
}

/* ---------------------------------- host ----------------------------------- */

const TOAST_ICON: Record<ToastType, { name: IoniconsName; color: string }> = {
  success: { name: 'checkmark-circle', color: colors.status.success },
  error: { name: 'alert-circle', color: colors.status.error },
  info: { name: 'information-circle', color: colors.text.secondary },
};

function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/70 justify-end">
          <TouchableWithoutFeedback>
            <View
              className="bg-surface-card rounded-t-[28px] px-6 pt-3"
              style={{ paddingBottom: insets.bottom + 20 }}
            >
              <View className="self-center w-10 h-1 rounded-full bg-surface-border mb-5" />
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function DialogHost() {
  const insets = useSafeAreaInsets();
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [sheetState, setSheetState] = useState<ActionSheetOptions | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.timing(toastAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [toastAnim]);

  useEffect(() => {
    api = {
      confirm: (opts) =>
        new Promise<boolean>((resolve) => {
          setConfirmState({ ...opts, resolve });
        }),
      actionSheet: (opts) => setSheetState(opts),
      toast: (message, type) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        toastTimer.current = setTimeout(hideToast, 2600);
      },
    };
    return () => {
      api = null;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toastAnim, hideToast]);

  const settleConfirm = (value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  return (
    <>
      {/* Confirmação */}
      <Sheet visible={confirmState != null} onClose={() => settleConfirm(false)}>
        {confirmState && (
          <>
            <Text className="text-text-primary text-lg font-extrabold tracking-tight">
              {confirmState.title}
            </Text>
            {confirmState.message ? (
              <Text className="text-text-secondary text-[14px] leading-[21px] mt-2">
                {confirmState.message}
              </Text>
            ) : null}
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mt-6 ${
                confirmState.destructive ? 'bg-status-error' : 'bg-brand-primary'
              }`}
              onPress={() => settleConfirm(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={confirmState.confirmLabel}
            >
              <Text className="text-white font-bold text-base">{confirmState.confirmLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-2xl py-4 items-center mt-2"
              onPress={() => settleConfirm(false)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={confirmState.cancelLabel ?? 'Cancelar'}
            >
              <Text className="text-text-secondary font-semibold text-base">
                {confirmState.cancelLabel ?? 'Cancelar'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Sheet>

      {/* Action sheet */}
      <Sheet visible={sheetState != null} onClose={() => setSheetState(null)}>
        {sheetState && (
          <>
            {sheetState.title ? (
              <Text
                className="text-text-secondary text-[11px] font-semibold uppercase mb-2"
                style={{ letterSpacing: 1.4 }}
              >
                {sheetState.title}
              </Text>
            ) : null}
            {sheetState.items.map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={{ height: 0.5, backgroundColor: colors.surface.border }} />}
                <TouchableOpacity
                  className="flex-row items-center gap-3 py-4"
                  onPress={() => {
                    setSheetState(null);
                    item.onPress();
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={item.destructive ? colors.status.error : colors.text.primary}
                  />
                  <Text
                    className={`text-[16px] ${item.destructive ? 'text-status-error' : 'text-text-primary'}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="rounded-2xl py-4 items-center mt-2"
              onPress={() => setSheetState(null)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text className="text-text-secondary font-semibold text-base">Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </Sheet>

      {/* Toast */}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: insets.top + 12,
            left: 20,
            right: 20,
            alignItems: 'center',
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }),
              },
            ],
          }}
        >
          <View
            className="flex-row items-center gap-2 bg-surface-elevated rounded-full px-5 py-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 10,
              maxWidth: '100%',
            }}
          >
            <Ionicons name={TOAST_ICON[toast.type].name} size={17} color={TOAST_ICON[toast.type].color} />
            <Text className="text-text-primary text-sm font-semibold" numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}
