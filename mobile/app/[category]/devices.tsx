import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getDevices, Device } from '@/api/device';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';

const { width } = Dimensions.get('window');

export default function DevicesScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDevices()
      .then(setDevices)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryTitle = () => {
    if (!category) return t('home');
    const c = category as string;
    // Map categories to locale keys if possible, else fallback to capitalized
    if (c === 'screens') return t('screens');
    if (c === 'batteries') return t('batteries');
    if (c === 'connectors') return t('connectors');
    if (c === 'ics') return t('ics');
    if (c === 'schematics') return t('schematics');
    return c.charAt(0).toUpperCase() + c.slice(1);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={getCategoryTitle()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8632B" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {devices.map((device) => {
              // Extract colors based on some logic or fallback to defaults
              const colors = ['#000000', '#1B3C9B', '#D51834', '#C3A5EC', '#3659EE', '#82ED50', '#E42838', '#405BEE', '#E7B847', '#E56D30'];
              const bgColor = colors[device.id % colors.length];
              const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';

              return (
                <Pressable
                  key={device.id}
                  style={[styles.gridCard, { backgroundColor: bgColor }]}
                  onPress={() => {
                    router.push({
                      pathname: `/${category}/${device.id}/models` as any,
                      params: { deviceName: device.name }
                    });
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
    backgroundColor: '#F8F9FA',
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
