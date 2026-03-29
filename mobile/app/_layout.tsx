import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { useColorScheme } from '@/hooks/use-color-scheme';
import enLocale from '@/locale/en.json';
import arLocale from '@/locale/ar.json';
import "../global.css";
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
import { useLocale } from '@/hooks/use-locale';
import { useFonts } from 'expo-font';
import { I18nManager, Text } from 'react-native';
import ToastManager from 'toastify-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useLocaleStore } from '@/store/localeStore';
import { apiClient } from '@/api/apiClient';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://b618fcba055e77a023ca4360730cf2c4@o4507321451937792.ingest.us.sentry.io/4511130023100416',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Force LTR layout regardless of locale — prevents Arabic from flipping drawer/back button
I18nManager.forceRTL(false);
I18nManager.allowRTL(false);

export const unstable_settings = {
  anchor: '(tabs)',
};

const i18n = new I18n({
  en: enLocale,
  ar: arLocale,
});
i18n.locale = getLocales().at(0)?.languageCode ?? 'en';
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const router = useRouter();
  const { t } = useLocale();
  const _hasAuthHydrated = useAuthStore(state => state._hasHydrated);
  const _hasLocaleHydrated = useLocaleStore(state => state._hasHydrated);

  // Initialize push notifications
  usePushNotifications();

  const [fontsLoaded, fontError] = useFonts({
    'CoconNextArabic': require('../assets/cocon-next-arabic.ttf'),
  });

  useEffect(() => {
    if (_hasAuthHydrated && _hasLocaleHydrated && fontsLoaded) {
      const hideSplash = async () => {
        await SplashScreen.hideAsync();

        // Verify session is still valid (catches expired subscriptions on reload)
        const token = useAuthStore.getState().token;
        if (token) {
          try {
            await apiClient.get('/auth/me');
          } catch {
            // apiClient interceptor handles logout + will redirect via DrawerLayout guard
          }
        }

        router.replace('/splash');
      };
      hideSplash();
    }
  }, [_hasAuthHydrated, _hasLocaleHydrated, fontsLoaded]);

  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ToastManager />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" options={{ headerShown: false }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: t('modal') }} />
          </Stack>
          <StatusBar style="light" backgroundColor="#FB5507" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
});
