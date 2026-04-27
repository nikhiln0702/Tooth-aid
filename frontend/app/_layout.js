import { Stack } from "expo-router";
import { ConfigProvider } from "../context/ConfigContext";

export default function Layout() {
  return (
    // Wrap the entire Stack inside the ConfigProvider
    <ConfigProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* screens are auto-detected from file names */}
      </Stack>
    </ConfigProvider>
  );
}