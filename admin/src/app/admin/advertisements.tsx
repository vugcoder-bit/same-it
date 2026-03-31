import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    ActivityIndicator, Modal, TouchableOpacity,
    useWindowDimensions, Platform, TextInput, Alert,
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
    link?: string;
    createdAt: string;
}

export default function AdvertisementsScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [link, setLink] = useState('');
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
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

    const handleSubmit = async () => {
        if (!selectedImage && !editingAd) return;
        try {
            setUploading(true);
            if (editingAd) {
                await apiClient.put(`/admin/advertisements/${editingAd.id}`, { link });
                Toast.success('Advertisement updated!');
            } else {
                const formData = new FormData();
                if (link) formData.append('link', link);
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
                Toast.success('Advertisement uploaded!');
            }
            setSelectedImage(null);
            setLink('');
            setEditingAd(null);
            fetchAds();
        } catch (e) {
            Toast.error(editingAd ? 'Update failed' : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const performDelete = async () => {
            try {
                await apiClient.delete(`/admin/advertisements/${id}`);
                Toast.success('Deleted');
                fetchAds();
            } catch (e) {
                Toast.error('Delete failed');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this advertisement?')) {
                performDelete();
            }
        } else {
            Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this advertisement?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete },
                ]
            );
        }
    };

    const numColumns = isDesktop ? 3 : 2;

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 22 }]}>Advertisements</Text>
                    {editingAd && (
                        <TouchableOpacity onPress={() => { setEditingAd(null); setLink(''); setSelectedImage(null); }}>
                            <Text style={{ color: '#FB5507', fontWeight: 'bold' }}>Cancel Editing</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Upload Row */}
            <View style={styles.uploadCard}>
                    {editingAd ? (
                        <View style={styles.previewBox}>
                            <Image source={{ uri: editingAd.imageUrl }} style={styles.previewImage} contentFit="cover" />
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Editing this advertisement</Text>
                        </View>
                    ) : selectedImage ? (
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
                
                <View style={styles.actionRow}>
                    <TextInput
                        placeholder="Optional: Enter redirect link (e.g. https://...)"
                        style={styles.linkInput}
                        value={link}
                        onChangeText={setLink}
                        placeholderTextColor="#94A3B8"
                    />
                        <Pressable
                        onPress={handleSubmit}
                        style={[styles.uploadBtn, (!selectedImage && !editingAd || uploading) && { opacity: 0.5 }]}
                        disabled={(!selectedImage && !editingAd) || uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name={editingAd ? "save-outline" : "cloud-upload-outline"} size={20} color="#FFF" />
                                <Text style={styles.uploadBtnText}>{editingAd ? "Update" : "Upload"}</Text>
                            </>
                        )}
                    </Pressable>
                </View>
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
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardDate} numberOfLines={1}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                    {item.link && <Text style={{ fontSize: 10, color: '#FB5507' }} numberOfLines={1}>{item.link}</Text>}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity onPress={() => { setEditingAd(item); setLink(item.link || ''); }}>
                                        <Ionicons name="create-outline" size={20} color="#64748B" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#FB5507" />
                                    </TouchableOpacity>
                                </View>
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
    uploadCard: { marginBottom: 28, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 16 },
    pickBtn: { width: '100%', height: 120, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', gap: 6 },
    pickText: { color: '#94A3B8', fontSize: 13 },
    previewBox: { width: '100%', height: 120, position: 'relative' },
    previewImage: { width: '100%', height: '100%', borderRadius: 10 },
    removeBtn: { position: 'absolute', top: -8, right: -8 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    linkInput: {
        flex: 1,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 14,
        color: '#1E293B',
    },
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
