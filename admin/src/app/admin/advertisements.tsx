import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    ActivityIndicator, Modal, TouchableOpacity,
    useWindowDimensions, Platform,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Advertisement {
    id: number;
    imageUrl: string;
    createdAt: string;
}

export default function AdvertisementsScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => { fetchAds(); }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/advertisements');
            setAds(res.data.data || []);
        } catch (e) {
            Toast.error('Failed to load advertisements');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85,
        });
        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;
        try {
            setUploading(true);
            const formData = new FormData();
            if (Platform.OS === 'web') {
                const res = await fetch(selectedImage.uri);
                const blob = await res.blob();
                formData.append('image', blob, 'ad.png');
            } else {
                formData.append('image', {
                    uri: selectedImage.uri,
                    name: 'ad.png',
                    type: 'image/png',
                } as any);
            }
            await apiClient.post('/admin/advertisements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSelectedImage(null);
            fetchAds();
            Toast.success('Advertisement uploaded!');
        } catch (e) {
            Toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/advertisements/${id}`);
            Toast.success('Deleted');
            fetchAds();
        } catch (e) {
            Toast.error('Delete failed');
        }
    };

    const numColumns = isDesktop ? 3 : 2;

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 22 }]}>Advertisements</Text>
                    <Text style={styles.subtitle}>Manage carousel images shown in the mobile app.</Text>
                </View>
            </View>

            {/* Upload Row */}
            <View style={styles.uploadRow}>
                {selectedImage ? (
                    <View style={styles.previewBox}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} contentFit="cover" />
                        <Pressable onPress={() => setSelectedImage(null)} style={styles.removeBtn}>
                            <Ionicons name="close-circle" size={22} color="#FB5507" />
                        </Pressable>
                    </View>
                ) : (
                    <Pressable style={styles.pickBtn} onPress={pickImage}>
                        <Ionicons name="image-outline" size={28} color="#94A3B8" />
                        <Text style={styles.pickText}>Tap to select image</Text>
                    </Pressable>
                )}
                <Pressable
                    onPress={handleUpload}
                    style={[styles.uploadBtn, (!selectedImage || uploading) && { opacity: 0.5 }]}
                    disabled={!selectedImage || uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                        </>
                    )}
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={ads}
                    key={numColumns}
                    numColumns={numColumns}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
                    ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No advertisements yet.</Text></View>}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={[styles.card, { flex: 1 }]}>
                            <Pressable onPress={() => { setPreviewUrl(item.imageUrl); setPreviewVisible(true); }}>
                                <Image source={{ uri: item.imageUrl }} style={styles.adImage} contentFit="cover" />
                            </Pressable>
                            <View style={styles.cardFooter}>
                                <Text style={styles.cardDate} numberOfLines={1}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Text>
                                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#FB5507" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}
                />
            )}

            {/* Full-size preview modal */}
            <Modal transparent visible={previewVisible} animationType="fade">
                <Pressable style={styles.previewOverlay} onPress={() => setPreviewVisible(false)}>
                    <Image source={{ uri: previewUrl }} style={styles.fullImage} contentFit="contain" />
                    <Text style={{ color: '#FFF', marginTop: 12, opacity: 0.7 }}>Tap anywhere to close</Text>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    pickBtn: { flex: 1, height: 80, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', gap: 6 },
    pickText: { color: '#94A3B8', fontSize: 13 },
    previewBox: { flex: 1, height: 80, position: 'relative' },
    previewImage: { width: '100%', height: '100%', borderRadius: 10 },
    removeBtn: { position: 'absolute', top: -8, right: -8 },
    uploadBtn: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
    uploadBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    grid: { gap: 16, paddingBottom: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
    adImage: { width: '100%', height: 160 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    cardDate: { fontSize: 12, color: '#94A3B8', flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '90%', height: '70%' },
});
