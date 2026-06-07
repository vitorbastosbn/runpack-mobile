import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#18181B', borderTopColor: '#3F3F46' },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#71717A',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="friends" options={{ title: 'Amigos' }} />
      <Tabs.Screen name="groups" options={{ title: 'Grupos' }} />
      <Tabs.Screen name="history" options={{ title: 'Histórico' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
