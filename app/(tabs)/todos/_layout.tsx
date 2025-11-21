import { Stack } from 'expo-router';

export default function TodosLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
