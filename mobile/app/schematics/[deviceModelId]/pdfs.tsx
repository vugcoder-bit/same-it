import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSchematicsByDeviceModel, generateTempPdfUrl, Schematic } from '@/api/schematic';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';

export default function SchematicsPdfListScreen() {
  const { deviceModelId, modelName } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [pdfs, setPdfs] = useState<Schematic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (deviceModelId) {
      getSchematicsByDeviceModel(parseInt(deviceModelId as string))
        .then(setPdfs)
        .finally(() => setLoading(false));
    }
  }, [deviceModelId]);

  const handlePdfPress = async (schematic: Schematic) => {
    try {
      const fullUrl = await generateTempPdfUrl(schematic.id);
      // Extract the token from the URL to avoid router encoding issues
      const token = fullUrl.split('token=')[1];
      router.push({
        pathname: '/schematics/view' as any,
        params: { token, title: schematic.schematicType }
      });
    } catch (error) {
      console.error('Failed to get PDF URL', error);
      alert('Failed to load PDF');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#FB5507" />
      <AppHeader title={(modelName as string) || t('schematics')} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FB5507" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {pdfs.map((pdf) => (
            <Pressable
              key={pdf.id}
              style={styles.listItem}
              onPress={() => handlePdfPress(pdf)}
            >
              <Image source={require('@/assets/images/icons/pdf icon.png')} style={styles.fileIcon} contentFit="contain" />
              <View style={styles.textContainer}>
                <Text style={styles.listText}>{pdf.schematicType}</Text>
              </View>
            </Pressable>
          ))}
          {pdfs.length === 0 && !loading && (
            <Text style={styles.emptyText}>{t('noSchematicsFound')}</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FB5507',
    marginBottom: 12,
  },
  fileIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  listText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
