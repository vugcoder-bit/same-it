import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useColorScheme, I18nManager } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { StatusBar } from 'expo-status-bar';
import ToastManager from 'toastify-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Force LTR layout regardless of locale — prevents Arabic from flipping layout
I18nManager.forceRTL(false);
I18nManager.allowRTL(false);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { token, user, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  usePushNotifications();

  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !_hasHydrated) return;

    const inAuthGroup = segments[0] === 'login';

    if (!token && !inAuthGroup) {
      router.replace('/login');
    } else if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [token, segments, isReady, _hasHydrated]);

  if (!isReady || !_hasHydrated) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="index" />
        </Stack>
        <ToastManager />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
