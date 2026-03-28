import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { PdfView } from '@kishannareshpal/expo-pdf';
import { apiClient } from '@/api/apiClient';
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
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 8));
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

  const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';
  const fullUrl = token ? `${baseUrl}/api/schematics/view?token=${token}` : null;

  useEffect(() => {
    if (!fullUrl) return;

    let downloadedUri: string | null = null;

    const downloadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const fileName = `temp_schematic_${Date.now()}.pdf`;
        const localPath = `${FileSystem.cacheDirectory}${fileName}`;

        const downloadRes = await FileSystem.downloadAsync(fullUrl, localPath);

        if (downloadRes.status !== 200) {
          throw new Error(`Failed to download: Status ${downloadRes.status}`);
        }

        downloadedUri = downloadRes.uri;
        setLocalUri(downloadRes.uri);
      } catch (err: any) {
        setError(err.message || 'Failed to download PDF');
      } finally {
        setLoading(false);
      }
    };

    downloadPdf();

    return () => {
      if (downloadedUri) {
        FileSystem.deleteAsync(downloadedUri, { idempotent: true }).catch(() => {});
      }
    };
  }, [fullUrl]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={(title as string) || t('pdfViewer')} />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8632B" />
          <Text style={styles.loadingText}>{t('downloading') || 'Downloading...'}</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && localUri ? (
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.pdfContainer, animatedStyle]}>
            <PdfView
              uri={localUri}
              style={styles.pdfView}
              key={localUri}
            />
          </Animated.View>
        </GestureDetector>
      ) : !loading && !error && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8632B" />
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
    color: '#E8632B',
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
