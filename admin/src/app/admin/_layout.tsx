import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { Slot } from 'expo-router';
import { AdminSidebar } from '../../components/AdminSidebar';
import { MobileHeader } from '../../components/MobileHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = width > 768;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <SafeAreaView style={styles.container} edges={isDesktop ? [] : ['top', 'left', 'right']}>
      {isDesktop && <View style={{ height: insets.top }} />}
      {!isDesktop && <MobileHeader onMenuPress={toggleSidebar} />}

      <View style={styles.main}>
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        {!isDesktop && sidebarOpen && (
          <Pressable
            style={styles.overlay}
            onPress={closeSidebar}
          />
        )}

        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
});
