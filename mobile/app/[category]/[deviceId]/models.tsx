import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getDeviceModelsByDeviceId, DeviceModel } from '@/api/deviceModel';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';

export default function ModelsScreen() {
  const { category, deviceId, deviceName } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (deviceId) {
      getDeviceModelsByDeviceId(parseInt(deviceId as string))
        .then(setModels)
        .finally(() => setLoading(false));
    }
  }, [deviceId]);

  const handleModelPress = (model: DeviceModel) => {
    if (category === 'schematics') {
      router.push(`/schematics/${model.id}/pdfs` as any);
    } else {
      // For Screen or Battery, ask client what happens next
      console.log('Selected model:', model.name, 'under category:', category);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={(deviceName as string) || t('selectModel')} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8632B" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {models.map((model) => (
            <Pressable
              key={model.id}
              style={styles.listItem}
              onPress={() => handleModelPress(model)}
            >
              {category === 'schematics' && (
                <Text style={styles.icon}>📁</Text>
              )}
              <Text style={styles.listText}>{model.name}</Text>
            </Pressable>
          ))}
          {models.length === 0 && !loading && (
            <Text style={styles.emptyText}>{t('noModelsFound')}</Text>
          )}
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
