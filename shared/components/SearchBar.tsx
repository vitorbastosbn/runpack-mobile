import { TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences';
}

export function SearchBar({ value, onChangeText, placeholder, autoCapitalize = 'none' }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface-card rounded-full px-4 h-12">
      <Ionicons name="search" size={17} color={colors.text.disabled} />
      <TextInput
        className="flex-1 text-text-primary ml-2.5 text-[15px]"
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.text.disabled} />
        </TouchableOpacity>
      )}
    </View>
  );
}
