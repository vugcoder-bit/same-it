import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Dimensions, ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDeviceTypes, DeviceType } from '@/api/device';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';

const { width } = Dimensions.get('window');

interface SubCategory {
  id: number;
  name: string;
  imageUrl?: string;
  componentType: string;
}

// Categories that show brand list (existing behavior → then search / or models list)
const BRAND_CATEGORIES = ['screens', 'batteries', 'schematics'];
// Categories that show sub-category list first
const SUB_CATEGORIES_MAP: Record<string, string> = {
  ics: 'IC',
  connectors: 'CONNECTOR',
  adhesive: 'ADHESIVE',
};

export default function CategoryIndexScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const cat = category as string;
  const isSubCategory = !!SUB_CATEGORIES_MAP[cat];
  const isBrandCategory = BRAND_CATEGORIES.includes(cat);

  const [brands, setBrands] = useState<DeviceType[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';

  useEffect(() => {
    if (isSubCategory) {
      const type = SUB_CATEGORIES_MAP[cat];
      apiClient.get(`/component-sub-categories/${type}`)
        .then(res => setSubCategories(res.data.data || []))
        .catch(() => setSubCategories([]))
        .finally(() => setLoading(false));
    } else {
      getDeviceTypes()
        .then(setBrands)
        .catch(() => setBrands([]))
        .finally(() => setLoading(false));
    }
  }, [cat]);

  const getCategoryTitle = () => {
    if (cat === 'screens') return t('screens');
    if (cat === 'batteries') return t('batteries');
    if (cat === 'connectors') return t('connectors');
    if (cat === 'ics') return t('ics');
    if (cat === 'adhesive') return t('screenAdhesive');
    if (cat === 'schematics') return t('schematics');
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getComponentType = () => {
    if (cat === 'screens') return 'SCREEN';
    if (cat === 'batteries') return 'BATTERY';
    if (cat === 'ics') return 'IC';
    if (cat === 'connectors') return 'CONNECTOR';
    if (cat === 'adhesive') return 'ADHESIVE';
    return 'SCREEN';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <AppHeader title={getCategoryTitle()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FB5507" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* <Text style={styles.sectionTitle}>
            {isSubCategory ? t('selectSubCategory') : t('selectBrand')}
          </Text> */}
          <View style={cat === 'adhesive' ? styles.listContainer : styles.gridContainer}>
            {isSubCategory
              ? subCategories.map((item) => (
                <Pressable
                  key={item.id}
                  style={cat === 'adhesive' ? styles.adhesiveCard : styles.gridCard}
                  onPress={() => {
                    router.push({
                      pathname: `/${cat}/search` as any,
                      params: {
                        type: getComponentType(),
                        subCategoryId: item.id,
                        subCategoryName: item.name,
                      },
                    });
                  }}
                >
                  {cat === 'adhesive' ? (
                    <>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: `${baseUrl}/uploads/${item.imageUrl}` }}
                          style={styles.adhesiveImage}
                          contentFit="contain"
                        />
                      ) : (
                        <View style={[styles.fallbackAvatar, { marginRight: 24 }]}>
                          <Text style={styles.fallbackText}>{item.name.charAt(0)}</Text>
                        </View>
                      )}
                      <Text style={styles.adhesiveText}>{item.name}</Text>
                    </>
                  ) : (
                    <>
                      <View style={[styles.imageContainer, styles.borderStyle]}>
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: `${baseUrl}/uploads/${item.imageUrl}` }}
                            style={styles.cardImage}
                            contentFit="contain"
                          />
                        ) : (
                          <View style={styles.fallbackAvatar}>
                            <Text style={styles.fallbackText}>{item.name.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                    </>
                  )}
                </Pressable>
              ))
              : brands.map((brand) => (
                <Pressable
                  key={brand.id}
                  style={styles.gridCard}
                  onPress={() => {
                    if (cat === 'schematics') {
                      router.push({
                        pathname: `/schematics/models` as any,
                        params: { brandId: brand.id, brandName: brand.name },
                      });
                    } else {
                      router.push({
                        pathname: `/${cat}/search` as any,
                        params: {
                          type: getComponentType(),
                          brandId: brand.id,
                          brandName: brand.name,
                        },
                      });
                    }
                  }}
                >
                  <View style={styles.imageContainer}>
                    {brand.imageUrl ? (
                      <Image
                        source={{ uri: `${baseUrl}/uploads/${brand.imageUrl}` }}
                        style={styles.cardImage}
                        contentFit="contain"
                      />
                    ) : (
                      <View style={styles.fallbackAvatar}>
                        <Text style={styles.fallbackText}>{brand.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  {/* <Text style={styles.cardTitle} numberOfLines={1}>{brand.name}</Text> */}
                </Pressable>
              ))
            }
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 18, fontWeight: '600', color: '#333',
    marginBottom: 16, marginLeft: 4,
  },
  gridContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
    
  },
  listContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  adhesiveCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderWidth: 1.5, borderColor: '#FB5507', borderRadius: 24, padding: 16,
    marginBottom: 20, elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  adhesiveImage: { width: 60, height: 100, marginRight: 24 },
  adhesiveText: { fontSize: 20, fontWeight: '600', color: '#FB5507', flex: 1, textAlign: 'center' },
  gridCard: { width: '40%', alignItems: 'center', marginBottom: 2 },
  imageContainer: {
    width: '100%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 16,
    padding: 8, justifyContent: 'center', alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, marginBottom: 5
    
  },
  borderStyle: {
    borderWidth: 1, borderColor: '#FB5507',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, marginBottom: 5
  },
  cardImage: { width: '100%', height: '100%' },
  fallbackAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FB5507', justifyContent: 'center', alignItems: 'center',
  },
  fallbackText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  cardTitle: { fontSize: 13, color: '#444', fontWeight: '500', textAlign: 'center' },
});
