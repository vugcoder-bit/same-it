import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@/hooks/use-locale';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';

const ServiceCategoriesScreen = () => {
  const router = useRouter();
  const { t } = useLocale();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/service-categories');
      return response.data.data;
    }
  });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/services/${item.id}?name=${item.name}`)}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/${item.imageUrl}` }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="apps-outline" size={40} color="#E8632B" />
          </View>
        )}
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E8632B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('serviceCategories') || 'Service Categories'} />
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
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
  list: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '40%',
    marginHorizontal: '5%',
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8632B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ServiceCategoriesScreen;
