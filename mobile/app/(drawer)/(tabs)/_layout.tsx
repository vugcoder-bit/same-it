import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

import { useLocale } from '@/hooks/use-locale';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AdvertisementCarousel } from '@/components/AdvertisementCarousel';
import { StatusBar } from 'expo-status-bar';

const MaterialTopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

// Custom Tab Bar to reliably update active colors on swipe
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { t } = useLocale();
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#FB5507',
      height: Platform.OS === 'ios' ? 90 : 75,
      paddingBottom: Platform.OS === 'ios' ? 25 : 5,
      paddingTop: 5,
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? '#FFF' : '#FFD1B3';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const iconMap: any = {
          index: require('@/assets/svg/home.svg'),
          tools: require('@/assets/svg/tool.svg')
        };
        const labelMap: any = {
          index: t('home') || 'Home',
          tools: t('tools') || 'Tools'
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Image
              source={iconMap[route.name]}
              style={{ width: 24, height: 24, tintColor: color, opacity: isFocused ? 1 : 0.7, marginBottom: 4 }}
            />
            <Text style={{ color, fontSize: 12, fontWeight: isFocused ? 'bold' : 'normal' }}>
              {labelMap[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <DashboardHeader title={t('sameIt') || 'SAME IT'} />
      {/* Background extension like login hint */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: '#FB5507',
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        zIndex: 0,
      }} />
      <View style={{ zIndex: 1, paddingTop: 8, paddingHorizontal: 16 }}>
        <AdvertisementCarousel />
      </View>

      <MaterialTopTabs
        tabBarPosition="bottom"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ swipeEnabled: true }}
      >
        <MaterialTopTabs.Screen name="index" />
        <MaterialTopTabs.Screen name="tools" />
      </MaterialTopTabs>
    </View>
  );
}
