import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Pressable, 
    TextInput, ActivityIndicator, Modal, TouchableOpacity,
    FlatList, Platform, useWindowDimensions
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Category {
    id: number;
    name: string;
    imageUrl?: string;
}

interface Service {
    id: number;
    title: string;
    description: string;
    price: number;
    imagePath: string;
    duration?: string;
    deliveryTime?: string;
    categoryId?: number;
    category?: { name: string };
}

export default function ServicesManagementScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
    
    // Modals
    const [serviceModalVisible, setServiceModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    
    // Service Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedServiceImage, setSelectedServiceImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    
    // Category Form
    const [categoryName, setCategoryName] = useState('');
    const [selectedCategoryImage, setSelectedCategoryImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servRes, catRes] = await Promise.all([
                apiClient.get('/admin/services'),
                apiClient.get('/admin/service-categories')
            ]);
            setServices(servRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch (error) {
            console.error(error);
            Toast.error('Failed to load services and categories');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (type: 'service' | 'category') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'service' ? [16, 9] : [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            if (type === 'service') setSelectedServiceImage(result.assets[0]);
            else setSelectedCategoryImage(result.assets[0]);
        }
    };

    const handleSaveCategory = async () => {
        if (!categoryName) return;
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('name', categoryName);
            if (selectedCategoryImage) {
                if (Platform.OS === 'web') {
                    const res = await fetch(selectedCategoryImage.uri);
                    const blob = await res.blob();
                    formData.append('image', blob, 'cat.png');
                } else {
                    formData.append('image', { uri: selectedCategoryImage.uri, name: 'cat.png', type: 'image/png' } as any);
                }
            }

            if (editingId) {
                await apiClient.put(`/admin/service-categories/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post('/admin/service-categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setCategoryModalVisible(false);
            fetchData();
            Toast.success(`Category ${editingId ? 'updated' : 'created'}`);
        } catch (error) { 
            console.error(error); 
            Toast.error('Failed to save category');
        } finally { setSaving(false); }
    };

    const handleSaveService = async () => {
        if (!title || !price) return;
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('duration', duration);
            formData.append('deliveryTime', deliveryTime);
            if (selectedCategoryId) formData.append('categoryId', selectedCategoryId.toString());

            if (selectedServiceImage) {
                if (Platform.OS === 'web') {
                    const res = await fetch(selectedServiceImage.uri);
                    const blob = await res.blob();
                    formData.append('file', blob, 'service.png');
                } else {
                    formData.append('file', { uri: selectedServiceImage.uri, name: 'service.png', type: 'image/png' } as any);
                }
            }

            if (editingId) {
                await apiClient.put(`/admin/services/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post('/admin/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setServiceModalVisible(false);
            fetchData();
            Toast.success(`Service ${editingId ? 'updated' : 'created'}`);
        } catch (error) { 
            console.error(error); 
            Toast.error('Failed to save service');
        } finally { setSaving(false); }
    };

    const handleDelete = async (type: 'service' | 'category', id: number) => {
        try {
            const url = type === 'service' ? `/admin/services/${id}` : `/admin/service-categories/${id}`;
            await apiClient.delete(url);
            Toast.success(`${type === 'service' ? 'Service' : 'Category'} deleted`);
            fetchData();
        } catch (error) { 
            console.error(error); 
            Toast.error('Failed to delete');
        }
    };

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>Service Management</Text>
                    <Text style={styles.subtitle}>Manage categories and services catalog.</Text>
                </View>
                <View style={styles.tabContainer}>
                    <Pressable onPress={() => setActiveTab('categories')} style={[styles.tab, activeTab === 'categories' && styles.activeTab]}>
                        <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>Categories</Text>
                    </Pressable>
                    <Pressable onPress={() => setActiveTab('services')} style={[styles.tab, activeTab === 'services' && styles.activeTab]}>
                        <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>Services</Text>
                    </Pressable>
                </View>
                <Pressable 
                    onPress={() => {
                        setEditingId(null);
                        if (activeTab === 'categories') {
                            setCategoryName('');
                            setSelectedCategoryImage(null);
                            setCategoryModalVisible(true);
                        } else {
                            setTitle('');
                            setDescription('');
                            setPrice('');
                            setDuration('');
                            setDeliveryTime('');
                            setSelectedCategoryId(null);
                            setSelectedServiceImage(null);
                            setServiceModalVisible(true);
                        }
                    }} 
                    style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add {activeTab === 'categories' ? 'Category' : 'Service'}</Text>
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#E8632B" /></View>
            ) : (
                <FlatList
                    data={(activeTab === 'categories' ? categories : services) as any[]}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={isDesktop ? (activeTab === 'categories' ? 4 : 3) : 1}
                    key={activeTab + (isDesktop ? 'd' : 'm')} // Force re-render grid
                    contentContainerStyle={styles.list}
                    renderItem={({ item, index }: { item: any, index: number }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={[styles.card, !isDesktop && { maxWidth: '100%', marginBottom: 16 }]}>
                            {activeTab === 'categories' ? (
                                <View style={styles.catCardInner}>
                                    <View style={styles.catImageContainer}>
                                        {item.imageUrl ? (
                                            <Image source={{ uri: `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/services/${item.imageUrl}` }} style={styles.catImage} />
                                        ) : (
                                            <Ionicons name="apps-outline" size={32} color="#CBD5E1" />
                                        )}
                                    </View>
                                    <Text style={styles.catName}>{item.name}</Text>
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity onPress={() => { setEditingId(item.id); setCategoryName(item.name); setSelectedCategoryImage(null); setCategoryModalVisible(true); }}>
                                            <Ionicons name="pencil" size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete('category', item.id)}>
                                            <Ionicons name="trash" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={styles.imageContainer}>
                                        {item.imagePath ? (
                                            <Image source={{ uri: `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/services/${item.imagePath.split('/').pop()}` }} style={styles.cardImage} />
                                        ) : (
                                            <View style={styles.placeholderImg}><Ionicons name="image-outline" size={40} color="#CBD5E1" /></View>
                                        )}
                                        <View style={styles.priceTag}><Text style={styles.priceText}>${item.price}</Text></View>
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.catBadge}>{item.category?.name || 'No Category'}</Text>
                                        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity onPress={() => {
                                                setEditingId(item.id);
                                                setTitle(item.title);
                                                setDescription(item.description);
                                                setPrice(item.price.toString());
                                                setDuration(item.duration || '');
                                                setDeliveryTime(item.deliveryTime || '');
                                                setSelectedCategoryId(item.categoryId || null);
                                                setSelectedServiceImage(null); 
                                                setServiceModalVisible(true);
                                            }} style={styles.actionBtn}>
                                                <Ionicons name="pencil" size={16} color="#3B82F6" /><Text style={styles.actionBtnText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDelete('service', item.id)} style={styles.actionBtn}>
                                                <Ionicons name="trash" size={16} color="#EF4444" /><Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </Animated.View>
                    )}
                />
            )}

            {/* Category Modal */}
            <Modal transparent visible={categoryModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: isDesktop ? 450 : '95%' }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Category</Text>
                        <TextInput style={styles.input} placeholder="Category Name" value={categoryName} onChangeText={setCategoryName} />
                        <Text style={styles.label}>Category Image</Text>
                        <Pressable onPress={() => pickImage('category')} style={styles.imagePicker}>
                            {selectedCategoryImage || (editingId && categories.find(c => c.id === editingId)?.imageUrl) ? (
                                <Image 
                                    source={{ uri: selectedCategoryImage ? selectedCategoryImage.uri : `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/services/${categories.find(c => c.id === editingId)?.imageUrl}` }} 
                                    style={styles.previewImage} 
                                />
                            ) : (
                                <View style={styles.pickerInner}><Ionicons name="camera-outline" size={32} color="#94A3B8" /></View>
                            )}
                        </Pressable>
                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setCategoryModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSaveCategory} style={[styles.button, styles.saveBtn]} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Service Modal */}
            <Modal transparent visible={serviceModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: isDesktop ? 500 : '95%' }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Service</Text>
                            <TextInput style={styles.input} placeholder="Service Title" value={title} onChangeText={setTitle} />
                            <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Description" value={description} onChangeText={setDescription} />
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price ($)" value={price} onChangeText={setPrice} keyboardType="numeric" />
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Duration" value={duration} onChangeText={setDuration} />
                            </View>
                            <TextInput style={styles.input} placeholder="Delivery Time (e.g. 1-2 hours)" value={deliveryTime} onChangeText={setDeliveryTime} />
                            
                            <Text style={styles.label}>Select Category</Text>
                            <View style={styles.categoryPicker}>
                                {categories.map(cat => (
                                    <Pressable 
                                        key={cat.id} 
                                        onPress={() => setSelectedCategoryId(cat.id)}
                                        style={[styles.catBtn, selectedCategoryId === cat.id && styles.activeCatBtn]}
                                    >
                                        <Text style={[styles.catBtnText, selectedCategoryId === cat.id && styles.activeCatBtnText]}>{cat.name}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text style={styles.label}>Service Image</Text>
                            <Pressable onPress={() => pickImage('service')} style={styles.imagePicker}>
                                {selectedServiceImage || (editingId && services.find(s => s.id === editingId)?.imagePath) ? (
                                    <Image 
                                        source={{ uri: selectedServiceImage ? selectedServiceImage.uri : `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/services/${services.find(s => s.id === editingId)?.imagePath.split('/').pop()}` }} 
                                        style={styles.previewImage} 
                                    />
                                ) : (
                                    <View style={styles.pickerInner}><Ionicons name="camera-outline" size={32} color="#94A3B8" /></View>
                                )}
                            </Pressable>

                            <View style={styles.modalButtons}>
                                <Pressable onPress={() => setServiceModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                                <Pressable onPress={handleSaveService} style={[styles.button, styles.saveBtn]} disabled={saving}>
                                    {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
    tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    activeTab: { backgroundColor: '#FFF', elevation: 2 },
    tabText: { color: '#64748B', fontWeight: '600' },
    activeTabText: { color: '#E8632B' },
    addButton: { backgroundColor: '#E8632B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    list: { paddingBottom: 40 },
    card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', margin: 8 },
    catCardInner: { padding: 20, alignItems: 'center' },
    catImageContainer: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    catImage: { width: '100%', height: '100%' },
    catName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
    imageContainer: { height: 160, backgroundColor: '#F1F5F9', position: 'relative' },
    cardImage: { width: '100%', height: '100%' },
    placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    priceTag: { position: 'absolute', top: 12, right: 12, backgroundColor: '#E8632B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    priceText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    cardContent: { padding: 20 },
    itemTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    catBadge: { fontSize: 11, color: '#64748B', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
    itemDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 20 },
    cardActions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, justifyContent: 'center' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionBtnText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '90%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 8, marginTop: 12 },
    input: { height: 48, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, fontSize: 15, marginBottom: 16 },
    categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    catBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#F1F5F9' },
    activeCatBtn: { backgroundColor: '#E8632B' },
    catBtnText: { fontSize: 12, color: '#64748B' },
    activeCatBtnText: { color: '#FFF', fontWeight: 'bold' },
    imagePicker: { height: 160, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
    pickerInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
    button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#E8632B' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
