import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { searchCompatibility, Compatibility } from '@/api/compatibility';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';

const SUB_CATEGORIES_MAP: Record<string, string> = {
  screens: 'SCREEN',
  batteries: 'BATTERY',
  ics: 'IC',
  connectors: 'CONNECTOR',
  adhesive: 'ADHESIVE',
};

export default function ComponentsScreen() {
  const { category, deviceId, deviceName } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [results, setResults] = useState<Compatibility[]>([]);
  const [loading, setLoading] = useState(true);

  const getComponentType = () => {
    return SUB_CATEGORIES_MAP[category as string] || 'SCREEN';
  };

  useEffect(() => {
    if (deviceId) {
      searchCompatibility({
        type: getComponentType(),
        deviceId: parseInt(deviceId as string),
      })
        .then(setResults)
        .finally(() => setLoading(false));
    }
  }, [deviceId, category]);

  const getDisplayModels = (rawValue: any): string => {
    if (Array.isArray(rawValue)) return rawValue.join(', ');
    if (typeof rawValue === 'string') {
      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) return parsed.join(', ');
      } catch { }
      return rawValue;
    }
    return JSON.stringify(rawValue);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <AppHeader title={(deviceName as string) || t('compatibility')} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FB5507" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {results.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.componentType}</Text>
                </View>
              </View>
              <Text style={styles.modelName}>
                {item.device?.name || item.subCategory?.name || `ID: ${item.id}`}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.compatLabel}>{t('compatibleModels')}:</Text>
              <Text style={styles.compatText}>{getDisplayModels(item.compatibleModels)}</Text>
            </View>
          ))}
          {results.length === 0 && !loading && (
            <Text style={styles.emptyText}>{t('noResultsFound')}</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  typeBadge: {
    backgroundColor: '#FDF2F0', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 8,
  },
  typeText: { color: '#FB5507', fontSize: 11, fontWeight: 'bold' },
  modelName: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  compatLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#94A3B8',
    textTransform: 'uppercase', marginBottom: 6,
  },
  compatText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
