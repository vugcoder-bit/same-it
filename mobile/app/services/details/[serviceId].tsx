import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Image, Alert, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocale } from '@/hooks/use-locale';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { AppHeader } from '@/components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from 'toastify-react-native';
import * as Clipboard from 'expo-clipboard';

const ServiceDetailsScreen = () => {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const { t } = useLocale();

  // Form State
  const [quantity, setQuantity] = useState(1);
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [telegram, setTelegram] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await apiClient.get(`/services/${serviceId}`);
      return response.data.data;
    }
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await apiClient.get('/payment-methods');
      return response.data.data;
    }
  });

  const orderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiClient.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      router.replace('/services/success');
    },
    onError: (error: any) => {
      Alert.alert(t('error'), error.response?.data?.message || t('orderFailed'));
    }
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePlaceOrder = () => {
    if (!phone1 || !paymentMethodId || !image || (service?.requiresSN && !serialNumber)) {
      Alert.alert(t('error'), t('pleaseFillRequiredFields')); // Add to locale if needed
      return;
    }

    const formData = new FormData();
    formData.append('serviceId', serviceId as string);
    formData.append('paymentMethodId', paymentMethodId.toString());
    formData.append('quantity', quantity.toString());
    formData.append('totalPrice', (service.price * quantity).toString());
    formData.append('phone1', phone1);
    if (phone2) formData.append('phone2', phone2);
    if (telegram) formData.append('telegramUsername', telegram);
    if (serialNumber) formData.append('serialNumber', serialNumber);
    if (notes) formData.append('notes', notes);

    const filename = image.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image`;
    
    formData.append('paymentScreenshot', {
      uri: image,
      name: filename,
      type
    } as any);

    orderMutation.mutate(formData);
  };

  if (isLoadingService) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E8632B" />
      </View>
    );
  }

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.success(t('copiedSuccessfully') || 'Copied successfully');
  };

  const totalPrice = (service?.price || 0) * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#E8632B" />
      <AppHeader title={t('serviceDetails')} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.card}>
            {service?.imageUrl && (
              <Image 
                source={{ uri: `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/${service.imageUrl}` }} 
                style={styles.serviceImage} 
                contentFit="contain" 
              />
            )}
            <Text style={styles.serviceTitle}>{service?.title}</Text>
            <Text style={styles.serviceDesc}>{service?.description}</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>{t('duration')}</Text>
                <Text style={styles.infoValue}>{service?.duration || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>{t('deliveryTime')}</Text>
                <Text style={styles.infoValue}>{service?.deliveryTime || '-'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>{t('price')}</Text>
                <Text style={[styles.infoValue, { color: '#E8632B' }]}>${service?.price}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.quantityRow}>
              <Text style={styles.sectionTitle}>{t('quantity')}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qBtn}>
                  <Ionicons name="remove" size={20} color="#E8632B" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qBtn}>
                  <Ionicons name="add" size={20} color="#E8632B" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.fieldLabel}>{t('phoneNumber1')} *</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="phone-pad" 
              value={phone1}
              onChangeText={setPhone1}
              placeholder={t('phonePlaceholder')}
            />

            <Text style={styles.fieldLabel}>{t('phoneNumber2')}</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="phone-pad" 
              value={phone2}
              onChangeText={setPhone2}
            />

            <Text style={styles.fieldLabel}>{t('telegramUsername')}</Text>
            <TextInput 
              style={styles.input} 
              value={telegram}
              onChangeText={setTelegram}
              placeholder={t('telegramPlaceholder')}
            />

            <Text style={styles.fieldLabel}>
              {t('serialNumber')} {service?.requiresSN ? '*' : `(${t('optional') || 'Optional'})`}
            </Text>
            <TextInput 
              style={styles.input} 
              value={serialNumber}
              onChangeText={setSerialNumber}
            />

            <Text style={styles.fieldLabel}>{t('notes')}</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              multiline 
              value={notes}
              onChangeText={setNotes}
            />

            <Text style={styles.sectionTitle}>{t('selectPaymentMethod')} *</Text>
            <View style={styles.paymentContainer}>
              {paymentMethods?.map((pm: any) => (
                <TouchableOpacity 
                  key={pm.id} 
                  style={[
                    styles.paymentCard, 
                    { borderColor: '#E0E0E0', borderWidth: 1.5 },
                    paymentMethodId === pm.id && { borderColor: pm.color, backgroundColor: pm.color + '10', borderWidth: 2 }
                  ]}
                  onPress={() => setPaymentMethodId(pm.id)}
                >
                  <Text style={[styles.pmTitle, { color: pm.color }]}>{pm.title}</Text>
                  
                  <View style={styles.accountRow}>
                    <Text style={styles.pmAccount}>{pm.accountNumber}</Text>
                    <TouchableOpacity onPress={() => handleCopy(pm.accountNumber)}>
                      <Ionicons name="copy-outline" size={18} color="#666" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                  </View>

                  {pm.note && <Text style={styles.pmNote}>{pm.note}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('paymentScreenshot')} *</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="camera" size={30} color="#999" />
                  <Text style={styles.uploadText}>{t('uploadScreenshot')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('totalPrice')}</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.orderBtn, orderMutation.isPending && { opacity: 0.7 }]} 
            onPress={handlePlaceOrder}
            disabled={orderMutation.isPending}
          >
            {orderMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.orderBtnText}>{t('placeOrder')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', margin: 15, padding: 20, borderRadius: 15, elevation: 3, borderWidth: 1.5, borderColor: '#E8632B' },
  serviceImage: { width: '100%', height: 150, marginBottom: 15, borderRadius: 10 },
  serviceTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  serviceDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 5 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  formSection: { padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 15 },
  fieldLabel: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#DDD', fontSize: 15 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, borderWidth: 1, borderColor: '#EEE' },
  qBtn: { padding: 8, paddingHorizontal: 12 },
  quantityText: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 },
  paymentContainer: { gap: 10 },
  paymentCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1 },
  pmTitle: { fontSize: 16, fontWeight: 'bold' },
  accountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pmAccount: { fontSize: 15, color: '#333' },
  pmNote: { fontSize: 12, color: '#666', marginTop: 4 },
  uploadBtn: { backgroundColor: '#FFF', height: 180, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CCC', overflow: 'hidden' },
  uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadText: { marginTop: 10, color: '#999' },
  previewImage: { width: '100%', height: '100%' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, elevation: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 16, color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#E8632B' },
  orderBtn: { backgroundColor: '#E8632B', borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default ServiceDetailsScreen;
