import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { initDatabase } from "@/db";
import { useNotificationPermission } from "@/hooks/use-notifications";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform } from "react-native";

// 通知の表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// QueryClient インスタンスを作成（グローバルに1つ）
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1分間はキャッシュを使用（パフォーマンス向上）
      gcTime: 1000 * 60 * 5, // 5分間キャッシュを保持
      retry: 1, // エラー時1回リトライ
      refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize database
  useEffect(() => {
    initDatabase().catch((err) => {
      console.error("Failed to initialize database:", err);
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // 通知パーミッションをリクエスト
  useNotificationPermission();

  // 通知タップ時のハンドラー
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const todoId = response.notification.request.content.data?.todoId;
        if (todoId) {
          router.push(`/todo/${todoId}`);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="todo/[id]"
          options={{
            headerBackButtonDisplayMode: "minimal",
            headerTransparent: Platform.OS === "ios",
            headerLargeTitle: false,
            presentation:
              Platform.OS === "ios" && isLiquidGlassAvailable()
                ? "formSheet"
                : "modal",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.8, 1.0],
            sheetInitialDetentIndex: 0,
            contentStyle: {
              backgroundColor: isLiquidGlassAvailable()
                ? "transparent"
                : undefined,
            },
            headerStyle: {
              backgroundColor: isLiquidGlassAvailable()
                ? "transparent"
                : undefined,
            },
          }}
        />
        <Stack.Screen name="glass-effect" options={{ title: "Glass Effect" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
