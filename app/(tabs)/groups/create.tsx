import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGroup } from '@features/groups/hooks/useGroups';

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
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Novo Grupo</Text>
      </View>

      <View className="px-4 gap-4">
        <View>
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Nome *</Text>
          <TextInput
            className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-text-primary text-base"
            placeholder="Nome do grupo"
            placeholderTextColor="#52525B"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <Text className="text-text-disabled text-xs mt-1 text-right">{name.length}/50</Text>
        </View>

        <View>
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Descrição</Text>
          <TextInput
            className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-text-primary text-base"
            placeholder="Opcional"
            placeholderTextColor="#52525B"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
          <Text className="text-text-disabled text-xs mt-1 text-right">{description.length}/200</Text>
        </View>

        {error && (
          <Text className="text-status-error text-sm">{error}</Text>
        )}

        <TouchableOpacity
          className="w-full bg-brand-primary rounded-xl py-4 items-center mt-2"
          onPress={handleCreate}
          disabled={createGroup.isPending}
          activeOpacity={0.85}
        >
          {createGroup.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Criar Grupo</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
