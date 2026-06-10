import { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

interface StartRaceModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onStart: (distanceGoalM: number | null) => void;
}

type Selection = 'none' | 'custom' | number;

type Preset = { label: string; value: Selection };

// Row 1: distance presets. Row 2: no-goal + custom.
const ROWS: Preset[][] = [
  [
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
  ],
  [
    { label: 'Sem meta', value: 'none' },
    { label: 'Outro', value: 'custom' },
  ],
];

const MIN_KM = 0.1;
const MAX_KM = 100;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function parseKm(raw: string): number | null {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) return null;
  const km = Number(normalized);
  if (!Number.isFinite(km)) return null;
  return km;
}

export function StartRaceModal({ visible, loading, onClose, onStart }: StartRaceModalProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Selection>(3000);
  const [customKm, setCustomKm] = useState('');

  const customKmValue = useMemo(() => parseKm(customKm), [customKm]);
  const customError =
    selected === 'custom' && customKm.length > 0 &&
    (customKmValue == null || customKmValue < MIN_KM || customKmValue > MAX_KM);

  const resolvedGoalM = useMemo<number | null | undefined>(() => {
    if (selected === 'none') return null;
    if (selected === 'custom') {
      if (customKmValue == null || customKmValue < MIN_KM || customKmValue > MAX_KM) return undefined;
      return Math.round(customKmValue * 1000);
    }
    return selected;
  }, [selected, customKmValue]);

  const canStart = resolvedGoalM !== undefined && !loading;

  const handleStart = () => {
    if (resolvedGoalM === undefined) return;
    onStart(resolvedGoalM);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={loading ? undefined : onClose}>
        <View className="flex-1 bg-black/70 justify-end">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View
                className="bg-surface-card rounded-t-[28px]"
                style={{ height: SCREEN_HEIGHT * 0.48, paddingBottom: insets.bottom + 16 }}
              >
                {/* Grabber */}
                <View className="self-center w-10 h-1 rounded-full bg-surface-border mt-3 mb-4" />

                {/* Header */}
                <View className="flex-row items-center justify-between px-6 mb-1">
                  <Text className="text-text-primary text-lg font-extrabold tracking-tight">
                    Meta da corrida
                  </Text>
                  <TouchableOpacity onPress={onClose} hitSlop={10} disabled={loading}>
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
                <Text className="text-text-secondary text-[13px] leading-5 px-6 mb-4">
                  Quando todos atingirem a meta, a corrida encerra automaticamente.
                </Text>

                {/* Cards grid — rows + columns flex to fill the available space */}
                <View className="flex-1 px-6 gap-3">
                  {ROWS.map((row, rowIdx) => (
                    <View key={rowIdx} className="flex-row gap-3 flex-1">
                      {row.map((preset) => {
                        const isSelected = selected === preset.value;
                        const isNumeric = typeof preset.value === 'number';
                        return (
                          <TouchableOpacity
                            key={preset.label}
                            onPress={() => setSelected(preset.value)}
                            disabled={loading}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            className={`flex-1 rounded-[20px] items-center justify-center px-3 ${
                              isSelected ? 'bg-brand-primary' : 'bg-surface-elevated'
                            }`}
                          >
                            {isNumeric ? (
                              <>
                                <Text
                                  className={`text-4xl font-extrabold ${
                                    isSelected ? 'text-white' : 'text-text-primary'
                                  }`}
                                  style={{ fontVariant: ['tabular-nums'] }}
                                >
                                  {(preset.value as number) / 1000}
                                </Text>
                                <Text
                                  className={`text-sm font-semibold mt-0.5 ${
                                    isSelected ? 'text-white/80' : 'text-text-secondary'
                                  }`}
                                >
                                  km
                                </Text>
                              </>
                            ) : (
                              <>
                                <Ionicons
                                  name={preset.value === 'none' ? 'infinite' : 'create-outline'}
                                  size={28}
                                  color={isSelected ? '#fff' : colors.text.secondary}
                                />
                                <Text
                                  className={`text-sm font-semibold mt-1.5 ${
                                    isSelected ? 'text-white' : 'text-text-secondary'
                                  }`}
                                >
                                  {preset.label}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>

                {/* Custom input */}
                {selected === 'custom' && (
                  <View className="px-6 mt-3">
                    <View
                      className={`flex-row items-center bg-surface-elevated rounded-2xl px-4 ${
                        customError ? 'border border-status-error' : ''
                      }`}
                    >
                      <TextInput
                        value={customKm}
                        onChangeText={setCustomKm}
                        keyboardType="decimal-pad"
                        placeholder="Digite a distância. Ex: 7.5"
                        placeholderTextColor={colors.text.disabled}
                        editable={!loading}
                        autoFocus
                        className="flex-1 text-text-primary text-base py-3.5"
                      />
                      <Text className="text-text-secondary text-base font-semibold ml-2">km</Text>
                    </View>
                    {customError && (
                      <Text className="text-status-error text-xs mt-1.5">
                        Informe um valor entre {MIN_KM} e {MAX_KM} km.
                      </Text>
                    )}
                  </View>
                )}

                {/* Start CTA — pinned above the nav bar */}
                <View className="px-6 pt-4">
                  <TouchableOpacity
                    onPress={handleStart}
                    disabled={!canStart}
                    activeOpacity={0.85}
                    className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${
                      canStart ? 'bg-brand-primary' : 'bg-surface-elevated'
                    }`}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={18} color={canStart ? '#fff' : colors.text.disabled} />
                        <Text className={`font-bold ${canStart ? 'text-white' : 'text-text-disabled'}`}>
                          Iniciar corrida
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
