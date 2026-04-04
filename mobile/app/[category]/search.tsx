import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  Pressable, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CompatibilityResult {
  id: number;
  componentType: string;
  deviceId?: number;
  subCategoryId?: number;
  compatibleModels: any;
  device?: {
    id: number;
    name: string;
    deviceType?: { name: string };
  };
  subCategory?: {
    id: number;
    name: string;
  };
}

export default function SearchScreen() {
  const { t } = useLocale();
  const { type, brandId, brandName, subCategoryId, subCategoryName } = useLocalSearchParams();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompatibilityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const contextLabel = brandName
    ? (brandName as string)
    : subCategoryName
      ? (subCategoryName as string)
      : '';

  const headerTitle = type
    ? contextLabel
      ? `${type as string} | ${contextLabel}`
      : (type as string)
    : t('searchCompatibility');

  const fetchResults = async (searchQuery = '') => {
    try {
      setLoading(true);
      if (searchQuery) setSearched(true);
      const params: Record<string, string> = {
        type: type as string,
        query: searchQuery.trim(),
      };
      if (brandId) params.brandId = brandId as string;
      if (subCategoryId) params.subCategoryId = subCategoryId as string;

      const res = await apiClient.get('/compatibility/search', { params });
      setResults(res.data.data || []);
      setSearched(true);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(); // Fetch all initially
  }, [type, brandId, subCategoryId]);

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

  const displayedResults = results.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const deviceName = item.device?.name?.toLowerCase() || '';
    const compModels = getDisplayModels(item.compatibleModels).toLowerCase();
    return deviceName.includes(q) || compModels.includes(q);
  });

  const handleSearch = () => {
    // Local filter is already applied via displayedResults
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <AppHeader title={headerTitle} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={22} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.resultsBar}>
        <Text style={styles.resultsLabel}>{t('results')}</Text>
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
      ) : (
        <FlatList
          data={displayedResults}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            searched && displayedResults.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>{t('noResultsFound')}</Text>
            ) : null
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 40)} style={styles.card}>
              {/* <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.componentType}</Text>
                </View>
              </View> */}
              <Text style={styles.compatText}>{getDisplayModels(item.compatibleModels)}</Text>

              {/* <Text style={styles.modelName}>
                {item.device?.name || item.subCategory?.name || `ID: ${item.id}`}
              </Text> */}
              {/* {item.device?.deviceType?.name ? (
                <Text style={styles.brandName}>{item.device.deviceType.name}</Text>
              ) : null} */}
              {/* <View style={styles.divider} /> */}
              {/* <Text style={styles.compatLabel}>{t('compatibleModels')}:</Text> */}
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, marginTop: 20,
  },
  input: {
    flex: 1, height: 50, backgroundColor: '#FFF', borderRadius: 10,
    paddingHorizontal: 16, fontSize: 15, color: '#1E293B',
    borderWidth: 1, borderColor: '#FB5507',
  },
  searchBtn: {
    width: 50, height: 50, backgroundColor: '#FB5507',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center'
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBlock: 30 },
  resultsBar: {
    borderBottomWidth: 2, borderBottomColor: '#FB5507',
    marginHorizontal: 16, paddingBottom: 0, marginBottom: 0, alignItems: 'center'
  },
  resultsLabel: { color: '#4CAF50', fontWeight: '500', fontSize: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#FB5507',
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
  brandName: { fontSize: 13, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  compatLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#94A3B8',
    textTransform: 'uppercase', marginBottom: 6,
  },
  compatText: { fontSize: 24, color: '#000', lineHeight: 25, textAlign: 'center' },
});
