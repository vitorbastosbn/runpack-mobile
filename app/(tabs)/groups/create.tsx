import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateGroup } from '@features/groups/hooks/useGroups';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { Button } from '@shared/components/Button';
import { colors } from '@constants/theme';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createGroup = useCreateGroup();

  const handleCreate = async () => {
    setError(null);
    if (name.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres');
      return;
    }
    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      router.replace(`/(tabs)/groups/${group.id}`);
    } catch {
      setError('Erro ao criar grupo. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Novo grupo" onBack={() => router.back()} />

      <View className="px-5 gap-5 mt-2">
        <View>
          <Text
            className="text-text-secondary text-[11px] font-semibold uppercase mb-2"
            style={{ letterSpacing: 1.4 }}
          >
            Nome *
          </Text>
          <TextInput
            className="bg-surface-card rounded-2xl px-4 py-3.5 text-text-primary text-base"
            placeholder="Nome do grupo"
            placeholderTextColor={colors.text.disabled}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <Text className="text-text-disabled text-xs mt-1.5 text-right">{name.length}/50</Text>
        </View>

        <View>
          <Text
            className="text-text-secondary text-[11px] font-semibold uppercase mb-2"
            style={{ letterSpacing: 1.4 }}
          >
            Descrição
          </Text>
          <TextInput
            className="bg-surface-card rounded-2xl px-4 py-3.5 text-text-primary text-base"
            placeholder="Opcional"
            placeholderTextColor={colors.text.disabled}
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top', minHeight: 88 }}
          />
          <Text className="text-text-disabled text-xs mt-1.5 text-right">{description.length}/200</Text>
        </View>

        {error && <Text className="text-status-error text-sm">{error}</Text>}

        <Button label="Criar grupo" onPress={handleCreate} loading={createGroup.isPending} />
      </View>
    </KeyboardAvoidingView>
  );
}
