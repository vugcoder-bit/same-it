import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@/hooks/use-locale';
import { Ionicons } from '@expo/vector-icons';

const OrderSuccessScreen = () => {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>
        <Text style={styles.title}>{t('orderSuccessful')}</Text>
        <Text style={styles.message}>{t('orderProcessingMessage')}</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/(drawer)/(tabs)')}
        >
          <Text style={styles.btnText}>{t('home')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.outlineBtn]}
          onPress={() => router.replace('/order-history')}
        >
          <Text style={[styles.btnText, { color: '#FB5507' }]}>{t('myRequests')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconContainer: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  message: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  btn: { backgroundColor: '#FB5507', width: '100%', borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FB5507' }
});

export default OrderSuccessScreen;
