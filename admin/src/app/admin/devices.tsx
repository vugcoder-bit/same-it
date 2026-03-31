import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, ActivityIndicator, Modal, TouchableOpacity,
    FlatList,
    useWindowDimensions, Platform
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

interface DeviceType {
    id: number;
    name: string;
    imageUrl?: string;
}

interface Device {
    id: number;
    name: string;
    deviceTypeId?: number;
    deviceType?: DeviceType;
}

interface DeviceModel {
    id: number;
    name: string;
    deviceId: number;
    deviceName?: string;
}

export default function DevicesManagementScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [devices, setDevices] = useState<Device[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'devices' | 'models' | 'types'>('devices');

    // Modals
    const [deviceModalVisible, setDeviceModalVisible] = useState(false);
    const [modelModalVisible, setModelModalVisible] = useState(false);

    // Forms
    const [deviceName, setDeviceName] = useState('');
    const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<number | null>(null);
    const [modelName, setModelName] = useState('');
    const [typeName, setTypeName] = useState('');
    const [typeIcon, setTypeIcon] = useState<any>(null);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const filteredDeviceTypes = deviceTypes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDevices = devices.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.deviceType?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredModels = models.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.deviceName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [devRes, modRes, typeRes] = await Promise.all([
                apiClient.get('/admin/devices'),
                apiClient.get('/admin/device-models'),
                apiClient.get('/admin/device-types')
            ]);
            setDevices(devRes.data.data || []);
            setModels(modRes.data.data || []);
            setDeviceTypes(typeRes.data.data || []);
        } catch (error) {
            console.error('Error fetching devices/models:', error);
            Toast.error('Failed to load devices and models');
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
        if (!result.canceled) {
            setTypeIcon(result.assets[0]);
        }
    };

    const handleSaveType = async () => {
        if (!typeName) return;
        try {
            const formData = new FormData();
            formData.append('name', typeName);
            if (typeIcon) {
                if (Platform.OS === 'web') {
                    const res = await fetch(typeIcon.uri);
                    const blob = await res.blob();
                    formData.append('image', blob, 'logo.png');
                } else {
                    formData.append('image', {
                        uri: typeIcon.uri,
                        name: 'logo.png',
                        type: 'image/png'
                    } as any);
                }
            }

            if (editingId) {
                await apiClient.put(`/admin/device-types/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post('/admin/device-types', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setTypeModalVisible(false);
            fetchData();
            Toast.success(`Brand ${editingId ? 'updated' : 'created'}`);
        } catch (error) {
            console.error(error);
            Toast.error('Failed to save brand');
        }
    };

    const handleDeleteType = async (id: number) => {
        try {
            await apiClient.delete(`/admin/device-types/${id}`);
            Toast.success('Brand deleted');
            fetchData();
        } catch (error) {
            console.error(error);
            Toast.error('Failed to delete brand');
        }
    };

    const handleSaveDevice = async () => {
        if (!deviceName) return;
        try {
            const payload = {
                name: deviceName,
                deviceTypeId: selectedDeviceTypeId
            };
            if (editingId) {
                await apiClient.put(`/admin/devices/${editingId}`, payload);
            } else {
                await apiClient.post('/admin/devices', payload);
            }
            setDeviceModalVisible(false);
            setEditingId(null);
            fetchData();
            Toast.success(`Device ${editingId ? 'updated' : 'created'}`);
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to save device');
        }
    };

    const handleSaveModel = async () => {
        if (!modelName || !selectedDeviceId) return;
        try {
            if (editingId) {
                await apiClient.put(`/admin/device-models/${editingId}`, { name: modelName, deviceId: selectedDeviceId });
            } else {
                await apiClient.post('/admin/device-models', { name: modelName, deviceId: selectedDeviceId });
            }
            setModelModalVisible(false);
            fetchData();
            Toast.success(`Model ${editingId ? 'updated' : 'created'} successfully`);
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to save model');
        }
    };

    const handleDeleteDevice = async (id: number) => {
        try {
            await apiClient.delete(`/admin/devices/${id}`);
            Toast.success('Device deleted successfully');
            fetchData();
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to delete device');
        }
    };

    const handleDeleteModel = async (id: number) => {
        try {
            await apiClient.delete(`/admin/device-models/${id}`);
            Toast.success('Model deleted');
            fetchData();
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to delete model');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: isDesktop ? 32 : 16 }, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>Device Catalog</Text>
                    {/* <Text style={styles.subtitle}>Manage hardware devices and their specific models.</Text> */}
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabContainer}
                    style={!isDesktop && { width: '100%' }}
                >
                    <Pressable
                        onPress={() => setActiveTab('types')}
                        style={[styles.tab, activeTab === 'types' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'types' && styles.activeTabText]}>Brands</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('devices')}
                        style={[styles.tab, activeTab === 'devices' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'devices' && styles.activeTabText]}>Devices</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('models')}
                        style={[styles.tab, activeTab === 'models' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'models' && styles.activeTabText]}>Models</Text>
                    </Pressable>
                </ScrollView>
            </View>

            <View style={styles.actionRow}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${activeTab === 'types' ? 'brands' : activeTab}...`}
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </Pressable>
                    )}
                </View>
                <Pressable
                    onPress={() => {
                        setEditingId(null);
                        if (activeTab === 'types') {
                            setTypeName('');
                            setTypeIcon(null);
                            setTypeModalVisible(true);
                        } else if (activeTab === 'devices') {
                            setDeviceName('');
                            setSelectedDeviceTypeId(null);
                            setDeviceModalVisible(true);
                        } else {
                            setModelName('');
                            setSelectedDeviceId(null);
                            setModelModalVisible(true);
                        }
                    }}
                    style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add {activeTab === 'types' ? 'Brand' : activeTab === 'devices' ? 'Device' : 'Model'}</Text>
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <View style={styles.contentCard}>
                    {activeTab === 'types' ? (
                        <FlatList
                            data={filteredDeviceTypes}
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No brands found.</Text></View>}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <View style={[styles.avatar, { marginRight: 12 }]}>
                                        {item.imageUrl ? (
                                            <Image source={{ uri: `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/${item.imageUrl}` }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                        ) : (
                                            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <View style={styles.listMain}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => {
                                            setEditingId(item.id);
                                            setTypeName(item.name);
                                            setTypeIcon(null);
                                            setTypeModalVisible(true);
                                        }}>
                                            <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteType(item.id)}>
                                            <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    ) : activeTab === 'devices' ? (
                        <FlatList
                            data={filteredDevices}
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No devices found.</Text></View>}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <View style={styles.listMain}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemSub}>{item.deviceType?.name || 'No Brand'}</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => {
                                            setEditingId(item.id);
                                            setDeviceName(item.name);
                                            setSelectedDeviceTypeId(item.deviceTypeId || null);
                                            setDeviceModalVisible(true);
                                        }}>
                                            <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteDevice(item.id)}>
                                            <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    ) : (
                        <FlatList
                            data={filteredModels}
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No models found.</Text></View>}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <View style={styles.listMain}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemSub}>{item.deviceName || `Device ID: ${item.deviceId}`}</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => {
                                            setEditingId(item.id);
                                            setModelName(item.name);
                                            setSelectedDeviceId(item.deviceId);
                                            setModelModalVisible(true);
                                        }}>
                                            <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteModel(item.id)}>
                                            <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>
            )}

            {/* Brand Modal */}
            <Modal transparent visible={typeModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, !isDesktop && { width: '95%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Brand</Text>

                        <View style={styles.imageUploadRow}>
                            <Pressable onPress={pickImage} style={styles.imagePlaceholder}>
                                {typeIcon || (editingId && deviceTypes.find(t => t.id === editingId)?.imageUrl) ? (
                                    <Image
                                        source={{ uri: typeIcon ? typeIcon.uri : `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/services/${deviceTypes.find(t => t.id === editingId)?.imageUrl}` }}
                                        style={styles.uploadedImage}
                                    />
                                ) : (
                                    <Ionicons name="image-outline" size={32} color="#94A3B8" />
                                )}
                            </Pressable>
                            <View>
                                <Text style={styles.label}>Brand Logo</Text>
                                <Pressable onPress={pickImage}><Text style={{ color: '#FB5507', fontWeight: 'bold' }}>Change Logo</Text></Pressable>
                            </View>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Brand Name (e.g. iPhone, Samsung)"
                            value={typeName}
                            onChangeText={setTypeName}
                        />

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setTypeModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSaveType} style={[styles.button, styles.saveBtn]}><Text style={styles.saveBtnText}>Save</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Device Modal */}
            <Modal transparent visible={deviceModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, !isDesktop && { width: '95%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Device</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Device Name (e.g. iPhone 13)"
                            value={deviceName}
                            onChangeText={setDeviceName}
                        />

                        <Text style={styles.label}>Select Brand</Text>
                        <View style={styles.categoryPicker}>
                            {deviceTypes.map((type) => (
                                <Pressable
                                    key={type.id}
                                    onPress={() => setSelectedDeviceTypeId(type.id)}
                                    style={[styles.catBtn, selectedDeviceTypeId === type.id && styles.activeCatBtn]}
                                >
                                    <Text style={[styles.catBtnText, selectedDeviceTypeId === type.id && styles.activeCatBtnText]}>{type.name}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setDeviceModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSaveDevice} style={[styles.button, styles.saveBtn]}><Text style={styles.saveBtnText}>Save</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Model Modal */}
            <Modal transparent visible={modelModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, !isDesktop && { width: '95%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Model</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Model Name (e.g. A2633)"
                            value={modelName}
                            onChangeText={setModelName}
                        />
                        <Text style={styles.label}>Select Device</Text>
                        <ScrollView style={{ maxHeight: 200, marginTop: 8 }}>
                            {devices.map(dev => (
                                <Pressable
                                    key={dev.id}
                                    onPress={() => setSelectedDeviceId(dev.id)}
                                    style={[styles.devSelectItem, selectedDeviceId === dev.id && styles.activeDevSelect]}
                                >
                                    <Text style={selectedDeviceId === dev.id && { color: '#FB5507', fontWeight: 'bold' }}>{dev.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setModelModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSaveModel} style={[styles.button, styles.saveBtn]}><Text style={styles.saveBtnText}>Save</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
    tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    activeTab: { backgroundColor: '#FFF', elevation: 2 },
    tabText: { color: '#64748B', fontWeight: '600' },
    activeTabText: { color: '#FB5507' },
    actionRow: { marginBottom: 20, gap: 12 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, height: 46, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
    addButton: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-start', gap: 8 },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    contentCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    listItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
    listMain: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    itemSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', width: 450, borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { height: 48, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
    categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
    activeCatBtn: { backgroundColor: '#FB5507' },
    catBtnText: { color: '#64748B', fontWeight: '600' },
    activeCatBtnText: { color: '#FFF' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
    devSelectItem: { padding: 12, borderRadius: 8, marginBottom: 4, backgroundColor: '#F8FAFC' },
    activeDevSelect: { backgroundColor: '#FDF2F0', borderWidth: 1, borderColor: '#FB5507' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
    button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#FB5507' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarText: { color: '#64748B', fontWeight: 'bold' },
    imageUploadRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    imagePlaceholder: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F8FAFC', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
