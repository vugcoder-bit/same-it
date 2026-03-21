import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';
import { getDeviceModelsByBrandId, DeviceModel } from '@/api/device';
import { Ionicons } from '@expo/vector-icons';

export default function SchematicsModelsScreen() {
  const { brandId, brandName } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();

  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (brandId) {
      getDeviceModelsByBrandId(parseInt(brandId as string))
        .then(setModels)
        .catch(() => setModels([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [brandId]);

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={(brandName as string) || t('diagrams')} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t('search')}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.searchBtn}>
          <Ionicons name="search" size={22} color="#FFF" />
        </View>
      </View>

      <View style={styles.resultsBar}>
        <Text style={styles.resultsLabel}>{t('results')}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8632B" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredModels.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: `/schematics/${item.id}/pdfs` as any,
                  params: { modelName: item.name },
                });
              }}
            >
              <Image 
                source={require('@/assets/images/icons/folder.png')} // We'll assume this exists or use fallback
                style={styles.folderIcon} 
                contentFit="contain" 
              />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </Pressable>
          ))}
          {filteredModels.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>{t('noResultsFound')}</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16 },
  input: {
    flex: 1, height: 50, backgroundColor: '#FFF', borderRadius: 10,
    paddingHorizontal: 16, fontSize: 15, color: '#1E293B',
    borderWidth: 1, borderColor: '#E8632B',
  },
  searchBtn: {
    width: 50, height: 50, backgroundColor: '#E8632B',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center'
  },
  resultsBar: {
    borderBottomWidth: 2, borderBottomColor: '#E8632B',
    marginHorizontal: 16, paddingBottom: 8, marginBottom: 16, alignItems: 'center'
  },
  resultsLabel: { color: '#4CAF50', fontWeight: '500', fontSize: 16 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#E8632B', borderRadius: 8,
    padding: 16, marginBottom: 16
  },
  folderIcon: { width: 32, height: 32, marginRight: 16 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: '#1E293B' }
});
