import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/runs/index" />
      <Stack.Screen name="[id]/runs/[sessionId]" />
      <Stack.Screen name="create" />
    </Stack>
  );
}
