import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, Pressable, LayoutAnimation, UIManager, Platform } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ErrorLog {
  id: number;
  errorCode: string;
  description: string;
  solution: string;
}

export default function ErrorCodesScreen() {
  const { t } = useLocale();
  const [data, setData] = useState<ErrorLog[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/errors');
      setData(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    item.errorCode.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={t('errorLog')} />
      
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t('searchPlaceholder')}
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
        <View style={styles.center}><ActivityIndicator size="large" color="#E8632B" /></View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <Pressable style={styles.card} onPress={() => toggleExpand(item.id)}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.errorCode}>{item.errorCode}</Text>
                    <Text style={styles.errorDesc}>{item.description}</Text>
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
                </View>
                {isExpanded && (
                  <View style={styles.solutionBox}>
                    <Text style={styles.solutionLabel}>{t('solution')}:</Text>
                    <Text style={styles.solutionText}>{item.solution}</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>{t('noResultsFound')}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultsBar: {
    borderBottomWidth: 2, borderBottomColor: '#E8632B',
    marginHorizontal: 16, paddingBottom: 8, marginBottom: 16, alignItems: 'center'
  },
  resultsLabel: { color: '#4CAF50', fontWeight: '500', fontSize: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorCode: { fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 },
  errorDesc: { fontSize: 14, color: '#475569' },
  solutionBox: {
    marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9'
  },
  solutionLabel: { fontSize: 13, fontWeight: 'bold', color: '#10B981', marginBottom: 4, textTransform: 'uppercase' },
  solutionText: { fontSize: 15, color: '#1E293B', lineHeight: 22 }
});
