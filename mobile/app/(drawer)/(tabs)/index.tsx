import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AdvertisementCarousel } from '@/components/AdvertisementCarousel';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { t } = useLocale();
  const router = useRouter();

  const DATA = [
    { id: '1', title: t('batteries'), category: 'batteries', image: require('@/assets/images/home/1.png') },
    { id: '2', title: t('screens'), category: 'screens', image: require('@/assets/images/home/2.png') },
    { id: '3', title: t('connectors'), category: 'connectors', image: require('@/assets/images/home/5.png') },
    { id: '4', title: t('ics'), category: 'ics', image: require('@/assets/images/home/6.png') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Grid 2x2 */}
        <View style={styles.gridContainer}>
          {DATA.map((item) => (
            <Pressable key={item.id} style={styles.gridCard} onPress={() => { router.push(`/${item.category}` as any); }}>
              <Image source={item.image} style={styles.cardImage} contentFit="contain" />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Full width bottom card - Screen Adhesive */}
        <Pressable style={styles.fullWidthCard} onPress={() => { router.push('/adhesive' as any); }}>
          <Image
            source={require('@/assets/images/home/20250731_105611.png')}
            style={styles.fullCardImage}
            contentFit="contain"
          />
          <Text style={styles.cardTitle}>{t('screenAdhesive')}</Text>
        </Pressable>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
  },
  announcementCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    height: 120, // Give it some height to match screenshot
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  announcementText: {
    fontSize: 24,
    color: '#E8632B',
    textAlign: 'center',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8632B',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 8,
  },
  cardImage: {
    width: 60,
    height: 80,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: '#E8632B',
    fontWeight: '500',
  },
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginTop: 8,
  },
  fullCardImage: {
    width: 140,
    height: 120,
    marginBottom: 12,
  },
});
