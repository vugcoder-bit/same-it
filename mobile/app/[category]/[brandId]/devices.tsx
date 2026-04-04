import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDevices, Device } from '@/api/device';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';

const { width } = Dimensions.get('window');

export default function DevicesByBrandScreen() {
  const { category, brandId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandId) {
      getDevices({ deviceTypeId: parseInt(brandId as string) })
        .then(setDevices)
        .finally(() => setLoading(false));
    }
  }, [brandId]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <AppHeader title={t('devices') || 'Devices'} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FB5507" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {devices.map((device) => {
              const colors = ['#000000', '#1B3C9B', '#D51834', '#C3A5EC', '#3659EE', '#82ED50', '#E42838', '#405BEE', '#E7B847', '#E56D30'];
              const bgColor = colors[device.id % colors.length];
              const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';

              return (
                <Pressable
                  key={device.id}
                  style={[styles.gridCard, { backgroundColor: bgColor }]}
                  onPress={() => {
                    if (category === 'schematics') {
                      router.push({
                        pathname: `/schematics/${device.id}/pdfs` as any,
                        params: { modelName: device.name }
                      });
                    } else {
                      // For other categories like SCREEN, BATTERY, etc.
                      // We can either go to a device detail or components list.
                      // Given the requirement to simplify, we might need a components screen for the device.
                      router.push({
                        pathname: `/${category}/${device.id}/components` as any,
                        params: { deviceName: device.name }
                      });
                    }
                  }}
                >
                  {device.imageUrl ? (
                    <Image source={{ uri: `${baseUrl}/uploads/${device.imageUrl}` }} style={styles.cardImage} contentFit="contain" />
                  ) : (
                    <Text style={styles.cardText}>{device.name}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  gridCard: {
    width: '40%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
