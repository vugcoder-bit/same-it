import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { PdfView } from '@kishannareshpal/expo-pdf';
import { apiClient } from '@/api/apiClient';
import { useAuthStore } from '@/store/authStore';
import * as FileSystem from 'expo-file-system/legacy';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function PdfViewerScreen() {
  const { token, title } = useLocalSearchParams();

  const { t } = useLocale();
  const router = useRouter();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      console.log(`[PDF VIEW] Pinch update: scale=${e.scale}, savedScale=${savedScale.value}`);
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 30));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flex: 1,
  }));

  useEffect(() => {

    if (!token) return;
    let downloadedUri: string | null = null;

    const loadPdf = async () => {

      console.log(`[PDF VIEW] --- START loadPdf --- (token: ${String(token).substring(0, 15)}..., title: ${title})`);
      try {
        console.log('[PDF VIEW] Setting loading: true');
        setLoading(true);
        setError(null);

        // Use the token directly that was passed from the list screen
        const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';
        const fullUrl = `${baseUrl}/api/schematics/view?token=${token}`;

        console.log(`[PDF VIEW] apiClient.baseURL: ${apiClient.defaults.baseURL}`);
        console.log(`[PDF VIEW] Computed fullUrl: ${fullUrl}`);

        // Download the PDF to local cache
        const fileName = `temp_schematic_${Date.now()}.pdf`;
        const localPath = `${FileSystem.cacheDirectory}${fileName}`;

        console.log(`[PDF VIEW] localPath: ${localPath}`);

        console.log('[PDF VIEW] Starting downloadAsync...');
        const downloadRes = await FileSystem.downloadAsync(fullUrl, localPath);
        console.log('[PDF VIEW] downloadAsync completed');
        console.log(`[PDF VIEW] HTTP Status: ${downloadRes.status}`);
        console.log(`[PDF VIEW] Downloaded to: ${downloadRes.uri}`);

        if (downloadRes.status === 401) {
          console.log('[PDF VIEW] 401 Unauthorized - redirecting to login');
          // Token expired mid-session — logout and redirect
          useAuthStore.getState().logout();
          router.replace('/auth/login');
          return;
        }

        if (downloadRes.status !== 200) {
          console.error(`[PDF VIEW] Download failed with status ${downloadRes.status}`);
          throw new Error(`Download failed (HTTP ${downloadRes.status})`);
        }

        downloadedUri = downloadRes.uri;
        console.log('[PDF VIEW] Setting localUri');
        setLocalUri(downloadRes.uri);
      } catch (err: any) {
        console.error('[PDF VIEW] !!! ERROR !!!:', err);
        // If 401 from apiClient, interceptor already handled logout — just exit silently
        if (err?.response?.status === 401) {
          console.log('[PDF VIEW] 401 from apiClient - exiting silently');
          return;
        }
        setError(err.message || 'Failed to load PDF');
      } finally {
        console.log('[PDF VIEW] Finishing loadPdf, setting loading: false');
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (downloadedUri) {
        FileSystem.deleteAsync(downloadedUri, { idempotent: true }).catch(() => { });
      }
    };
  }, [token]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <AppHeader title={(title as string) || t('pdfViewer')} />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FB5507" />
          <Text style={styles.loadingText}>{t('downloading') || 'Downloading...'}</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && localUri ? (
        <View style={{ flex: 1 }}>
          <GestureDetector gesture={composed}>
            <Animated.View style={[styles.pdfContainer, animatedStyle]}>
              <PdfView
                uri={localUri}
                style={styles.pdfView}
                key={localUri}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      ) : !loading && !error && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FB5507" />
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#FB5507',
    padding: 20,
    textAlign: 'center',
  },
  pdfView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
