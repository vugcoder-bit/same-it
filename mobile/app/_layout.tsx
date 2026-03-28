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
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
import { useLocale } from '@/hooks/use-locale';
import { useFonts } from 'expo-font';
import { I18nManager } from 'react-native';
import ToastManager from 'toastify-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useLocaleStore } from '@/store/localeStore';

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

export default function RootLayout() {
  const router = useRouter();
  const { t } = useLocale();
  const _hasAuthHydrated = useAuthStore(state => state._hasHydrated);
  const _hasLocaleHydrated = useLocaleStore(state => state._hasHydrated);

  const [fontsLoaded] = useFonts({
    'CoconNextArabic': require('@/assets/cocon-next-arabic.ttf'),
  });

  useEffect(() => {
    if (_hasAuthHydrated && _hasLocaleHydrated && fontsLoaded) {
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
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
          <StatusBar style="light" backgroundColor="#E8632B" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
