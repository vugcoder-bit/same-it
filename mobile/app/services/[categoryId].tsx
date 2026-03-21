import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocale } from '@/hooks/use-locale';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';
import { StatusBar } from 'expo-status-bar';

const ServicesListScreen = () => {
  const router = useRouter();
  const { categoryId, name } = useLocalSearchParams();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', categoryId],
    queryFn: async () => {
      const response = await apiClient.get(`/services/category/${categoryId}`);
      return response.data.data;
    }
  });

  const filteredServices = services?.filter((s: any) => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.serviceItem}
      onPress={() => router.push(`/services/details/${item.id}`)}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.badgeRow}>
          {item.duration && <View style={styles.badge}><Text style={styles.badgeText}>{item.duration}</Text></View>}
          {item.deliveryTime && <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}><Text style={[styles.badgeText, { color: '#2196F3' }]}>{item.deliveryTime}</Text></View>}
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>${item.price}</Text>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={(Array.isArray(name) ? name[0] : name) || t('services')} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t('searchServices')}
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.searchBtn}>
          <Ionicons name="search" size={22} color="#FFF" />
        </View>
      </View>

      <View style={styles.resultsBar}>
        <Text style={styles.resultsLabel}>{t('results')}</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E8632B" />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{t('noResultsFound')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
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
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#E8632B',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E8632B',
    marginRight: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  }
});

export default ServicesListScreen;
