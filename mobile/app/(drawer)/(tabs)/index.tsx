import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
// import { DashboardHeader } from '@/components/DashboardHeader';
// import { StatusBar } from 'expo-status-bar';
import { useLocale } from '@/hooks/use-locale';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 90) / 2; // 2 columns with padding

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
      <ScrollView overScrollMode='auto' scrollEnabled={false} contentContainerStyle={styles.scrollContent}>
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
    // width: '90%',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 1,

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
    alignItems: 'center',
    justifyContent: 'center',
    // justifyContent: 'space-around',
    // rowGap: 10,
    gap: 12,
    columnGap: 20,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FB5507',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // marginBottom: 2,
  },
  cardImage: {
    width: 55,
    height: 70,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: '#FB5507',
    fontWeight: '500',
  },
  fullWidthCard: {
    width: CARD_WIDTH * 2 + 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 'auto',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FB5507',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: 12,
  },
  fullCardImage: {
    width: 140,
    height: 80,
    // marginBottom: 10,
  },
});
