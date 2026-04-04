import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, ActivityIndicator, Modal, TouchableOpacity,
    FlatList, Platform,
    useWindowDimensions
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Schematic {
    id: number;
    schematicType: string;
    pdfFile: string;
    deviceId: number;
    device?: { id: number; name: string };
}

interface Device {
    id: number;
    name: string;
    deviceTypeId: number;
}

interface DeviceType {
    id: number;
    name: string;
}

export default function SchematicsManagementScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [schematics, setSchematics] = useState<Schematic[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form fields
    const [title, setTitle] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const [uploading, setUploading] = useState(false);
    const [searchDevice, setSearchDevice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSchematics = schematics.filter(s =>
        s.schematicType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.device?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [schemRes, devRes, brandRes] = await Promise.all([
                apiClient.get('/admin/schematics'),
                apiClient.get('/admin/devices'),
                apiClient.get('/admin/device-types')
            ]);
            setSchematics(schemRes.data.data || []);
            setDevices(devRes.data.data || []);
            setDeviceTypes(brandRes.data.data || []);
        } catch (error) {
            console.error(error);
            Toast.error('Failed to load schematics data');
        }
        finally { setLoading(false); }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                setSelectedFile(result);
            }
        } catch (error) { console.error(error); }
    };

    const handleUpload = async () => {
        if (!title || !selectedDeviceId || !selectedFile || selectedFile.canceled) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('schematicType', title);
            formData.append('deviceId', selectedDeviceId.toString());

            const asset = selectedFile.assets[0];

            // For web/mobile compatibility
            if (Platform.OS === 'web') {
                const response = await fetch(asset.uri);
                const blob = await response.blob();
                formData.append('pdfFile', blob, asset.name);
            } else {
                formData.append('pdfFile', {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/pdf',
                } as any);
            }

            await apiClient.post('/admin/schematics', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setModalVisible(false);
            resetForm();
            fetchData();
            Toast.success('Schematic uploaded successfully');
        } catch (error: any) {
            console.error('Upload failed:', error);
            Toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSelectedBrandId(null);
        setSelectedDeviceId(null);
        setSelectedFile(null);
        setSearchDevice('');
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/schematics/${id}`);
            Toast.success('Schematic deleted');
            fetchData();
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to delete schematic');
        }
    };

    const filteredDevices = selectedBrandId 
        ? devices.filter(d => (d as any).deviceTypeId === selectedBrandId)
        : devices;

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>Schematics Library</Text>
                    <Text style={styles.subtitle}>Upload and manage technical schematics and PDF manuals.</Text>
                </View>
                <Pressable onPress={() => { setTitle(''); setSelectedFile(null); setSelectedBrandId(null); setSelectedDeviceId(null); setModalVisible(true); }} style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}>
                    <Ionicons name="cloud-upload" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Upload Schematic</Text>
                </Pressable>
            </View>

            <View style={styles.actionRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search schematics or devices..."
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
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={filteredSchematics}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={isDesktop ? 3 : 1}
                    ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No schematics found matching "{searchQuery}"</Text></View>}
                    columnWrapperStyle={isDesktop && filteredSchematics.length > 1 ? { gap: 20 } : undefined}
                    contentContainerStyle={styles.list}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={[styles.card, { maxWidth: isDesktop ? '31.5%' : '100%' }]}>
                            <View style={styles.pdfIcon}>
                                <Ionicons name="document-text" size={40} color="#FB5507" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.itemTitle} numberOfLines={1}>{item.schematicType}</Text>
                                <Text style={styles.itemModel}>{item.device?.name || `Device ID: ${item.deviceId}`}</Text>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.fileLabel}>PDF Schematic</Text>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                />
            )}

            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, !isDesktop && { width: '90%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>Upload Schematic</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Schematic Title</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. iPhone 13 Pro Logic Board" />
                        </View>

                        <Text style={styles.label}>Select Brand</Text>
                        <View style={[styles.brandPicker, { flexWrap: 'wrap', marginBottom: 16 }]}>
                            {deviceTypes.map((brand) => (
                                <Pressable
                                    key={brand.id}
                                    onPress={() => { setSelectedBrandId(brand.id); setSelectedDeviceId(null); }}
                                    style={[styles.brandPill, selectedBrandId === brand.id && styles.activeBrandPill]}
                                >
                                    <Text style={[styles.brandPillText, selectedBrandId === brand.id && styles.activeBrandPillText]}>
                                        {brand.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {selectedBrandId && (
                            <>
                                <Text style={styles.label}>Select Device</Text>
                                <TextInput
                                    style={[styles.input, { marginBottom: 12, height: 40 }]}
                                    value={searchDevice}
                                    onChangeText={setSearchDevice}
                                    placeholder="Type to filter devices..."
                                />
                                <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
                                    {filteredDevices.filter(d => d.name.toLowerCase().includes(searchDevice.toLowerCase())).map(d => (
                                        <Pressable
                                            key={d.id}
                                            onPress={() => setSelectedDeviceId(d.id)}
                                            style={[styles.selectItem, selectedDeviceId === d.id && styles.activeSelect]}
                                        >
                                            <Text style={selectedDeviceId === d.id && { color: '#FB5507', fontWeight: 'bold' }}>{d.name}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        <Text style={styles.label}>PDF File</Text>
                        <Pressable onPress={pickDocument} style={styles.filePicker}>
                            <Ionicons name="document-attach" size={24} color={selectedFile ? '#10B981' : '#94A3B8'} />
                            <Text style={styles.filePickerText}>
                                {selectedFile && !selectedFile.canceled ? selectedFile.assets[0].name : 'Choose PDF Document'}
                            </Text>
                        </Pressable>

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => { setModalVisible(false); resetForm(); }} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleUpload} style={[styles.button, styles.saveBtn]} disabled={uploading}>
                                {uploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Start Upload</Text>}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    addButton: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    actionRow: { marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, height: 46, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
    list: { gap: 20, paddingBottom: 40 },
    card: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
    pdfIcon: { height: 100, backgroundColor: '#FDF2F0', justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 16 },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    itemModel: { fontSize: 12, color: '#64748B', marginTop: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    fileLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', width: 450, borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
    input: { height: 48, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16 },
    brandPicker: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    brandPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F1F5F9' },
    activeBrandPill: { backgroundColor: '#FB5507' },
    brandPillText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    activeBrandPillText: { color: '#FFF' },
    selectItem: { padding: 10, borderRadius: 8, marginBottom: 4, backgroundColor: '#F8FAFC' },
    activeSelect: { backgroundColor: '#FDF2F0', borderWidth: 1, borderColor: '#FB5507' },
    filePicker: { height: 60, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
    filePickerText: { color: '#64748B', fontSize: 14 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#FB5507' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
