import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    ActivityIndicator, Modal, TextInput, TouchableOpacity,
    useWindowDimensions, Platform,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SubCategory {
    id: number;
    componentType: string;
    name: string;
    imageUrl?: string;
}

const COMPONENT_TABS = [
    { key: 'IC', label: 'IC Chip' },
    { key: 'CONNECTOR', label: 'Connector' },
    { key: 'ADHESIVE', label: 'Screen Adhesive' },
];

export default function SubCategoriesScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [activeType, setActiveType] = useState<'IC' | 'CONNECTOR' | 'ADHESIVE'>('IC');
    const [items, setItems] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState<any>(null);

    useEffect(() => { fetchItems(); }, [activeType]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/admin/component-sub-categories/${activeType}`);
            setItems(res.data.data || []);
        } catch (e) {
            Toast.error('Failed to load sub-categories');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setIcon(result.assets[0]);
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        try {
            const formData = new FormData();
            formData.append('componentType', activeType);
            formData.append('name', name.trim());
            if (icon) {
                if (Platform.OS === 'web') {
                    const res = await fetch(icon.uri);
                    const blob = await res.blob();
                    formData.append('image', blob, 'icon.png');
                } else {
                    formData.append('image', { uri: icon.uri, name: 'icon.png', type: 'image/png' } as any);
                }
            }
            if (editingId) {
                await apiClient.put(`/admin/component-sub-categories/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await apiClient.post('/admin/component-sub-categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setModalVisible(false);
            fetchItems();
            Toast.success(`Sub-category ${editingId ? 'updated' : 'created'}!`);
        } catch (e) {
            Toast.error('Failed to save');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/component-sub-categories/${id}`);
            Toast.success('Deleted');
            fetchItems();
        } catch (e) {
            Toast.error('Delete failed');
        }
    };

    const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 22 }]}>Sub-Categories</Text>
                    <Text style={styles.subtitle}>Manage IC, Connector, and Adhesive sub-types with images.</Text>
                </View>
                <Pressable
                    onPress={() => { setEditingId(null); setName(''); setIcon(null); setModalVisible(true); }}
                    style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Sub-Category</Text>
                </Pressable>
            </View>

            {/* Type tabs */}
            <View style={styles.tabRow}>
                {COMPONENT_TABS.map(tab => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setActiveType(tab.key as any)}
                        style={[styles.tab, activeType === tab.key && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeType === tab.key && styles.activeTabText]}>{tab.label}</Text>
                    </Pressable>
                ))}
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: '#94A3B8' }}>No sub-categories yet for this type.</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 40)} style={styles.listItem}>
                            <View style={styles.iconContainer}>
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: `${baseUrl}/uploads/${item.imageUrl}` }}
                                        style={{ width: 44, height: 44, borderRadius: 22 }}
                                        contentFit="contain"
                                    />
                                ) : (
                                    <View style={styles.fallbackIcon}>
                                        <Text style={{ color: '#FB5507', fontWeight: 'bold', fontSize: 16 }}>
                                            {item.name.charAt(0)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.listMain}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemType}>{item.componentType}</Text>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => {
                                    setEditingId(item.id);
                                    setName(item.name);
                                    setIcon(null);
                                    setModalVisible(true);
                                }}>
                                    <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#FB5507" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}
                />
            )}

            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.overlay}>
                    <View style={[styles.modal, !isDesktop && { width: '92%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Sub-Category</Text>
                        <Text style={styles.label}>Type: {COMPONENT_TABS.find(t => t.key === activeType)?.label}</Text>

                        <View style={styles.imageRow}>
                            <Pressable onPress={pickImage} style={styles.imagePlaceholder}>
                                {icon ? (
                                    <Image source={{ uri: icon.uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} contentFit="cover" />
                                ) : (
                                    <Ionicons name="image-outline" size={28} color="#94A3B8" />
                                )}
                            </Pressable>
                            <Pressable onPress={pickImage}>
                                <Text style={{ color: '#FB5507', fontWeight: '600' }}>
                                    {icon ? 'Change Image' : 'Pick Image'}
                                </Text>
                            </Pressable>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Sub-category name (e.g. IC Power)"
                            value={name}
                            onChangeText={setName}
                        />

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setModalVisible(false)} style={[styles.btn, styles.cancelBtn]}>
                                <Text>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleSave} style={[styles.btn, styles.saveBtn]}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    addButton: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    tabRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    activeTab: { backgroundColor: '#FFF', elevation: 2 },
    tabText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
    activeTabText: { color: '#FB5507' },
    list: { gap: 8, paddingBottom: 20 },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    iconContainer: { marginRight: 12 },
    fallbackIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FDF2F0', justifyContent: 'center', alignItems: 'center' },
    listMain: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    itemType: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 16 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#FFF', width: 440, borderRadius: 24, padding: 28 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' },
    label: { fontSize: 13, color: '#64748B', marginBottom: 16 },
    imageRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    imagePlaceholder: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    input: { height: 48, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, fontSize: 15, color: '#1E293B' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#FB5507' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
});
