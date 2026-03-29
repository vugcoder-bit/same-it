import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';
import { useRouter } from 'expo-router';
import { AdvertisementCarousel } from '@/components/AdvertisementCarousel';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 95) / 2; // 2 columns with padding

export default function ToolsScreen() {
  const { t } = useLocale();
  const router = useRouter();

  const DATA = [
    { id: '1', title: t('arabicCode'), image: require('@/assets/images/tools/arabic_code.png') },
    { id: '2', title: t('errorLog'), image: require('@/assets/images/tools/Error_log.png') },
    { id: '3', title: t('services'), image: require('@/assets/images/tools/services.png') },
    { id: '4', title: t('diagrams'), image: require('@/assets/images/tools/diagram.png') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Grid 2x2 */}
        <View style={styles.gridContainer}>
          {DATA.map((item) => (
            <Pressable
              key={item.id}
              style={styles.gridCard}
              onPress={() => {
                if (item.id === '1') {
                  router.push('/convert-arabic');
                } else if (item.id === '2') {
                  router.push('/error-codes');
                } else if (item.id === '3') {
                  router.push('/services');
                } else if (item.id === '4') {
                  router.push('/schematics');
                }
              }}
            >
              <Image source={item.image} style={styles.cardImage} contentFit="contain" />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
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
    paddingTop: 6,
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
    color: '#FB5507',
    textAlign: 'center',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FB5507',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    // marginBottom: 8,
    // minHeight: 160,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: '#FB5507',
    fontWeight: '500',
  },
});
