import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Image } from 'expo-image';

import { useLocale } from '@/hooks/use-locale';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AdvertisementCarousel } from '@/components/AdvertisementCarousel';
import { StatusBar } from 'expo-status-bar';

const MaterialTopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <DashboardHeader title={t('sameIt') || 'SAME IT'} />
      {/* Background extension like login hint */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: '#E8632B',
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        zIndex: 0,
      }} />
      <View style={{ zIndex: 1, paddingTop: 24 }}>
        <AdvertisementCarousel />
      </View>

      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: '#FFF',
          tabBarInactiveTintColor: '#FFD1B3',
          tabBarStyle: {
            backgroundColor: '#E8632B',
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#FFF',
            height: 3,
            top: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
            textTransform: 'none',
          },
        }}>
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: t('home'),
            tabBarIcon: ({ color, focused }) => (
              <Image
                source={require('@/assets/svg/home.svg')}
                style={{ width: 24, height: 24, tintColor: color, opacity: focused ? 1 : 0.7 }}
              />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="tools"
          options={{
            title: t('tools'),
            tabBarIcon: ({ color, focused }) => (
              <Image
                source={require('@/assets/svg/tool.svg')}
                style={{ width: 24, height: 24, tintColor: color, opacity: focused ? 1 : 0.7 }}
              />
            ),
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}
