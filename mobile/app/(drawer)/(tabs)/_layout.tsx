import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Image } from 'expo-image';

import { HapticTab } from '@/components/haptic-tab';
import { useLocale } from '@/hooks/use-locale';

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#FFD1B3',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#E8632B',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
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
      <Tabs.Screen
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
    </Tabs>
  );
}
