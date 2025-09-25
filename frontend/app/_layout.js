import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* screens are auto-detected from file names */}
    </Stack>
  );
}
