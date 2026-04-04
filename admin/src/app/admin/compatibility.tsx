import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, ActivityIndicator, Modal, TouchableOpacity,
    FlatList,
    useWindowDimensions
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Device {
    id: number;
    name: string;
    deviceType?: { name: string };
}

interface SubCategory {
    id: number;
    name: string;
    componentType: string;
}

interface DeviceType {
    id: number;
    name: string;
}

export default function CompatibilityManagementScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [compatibilities, setCompatibilities] = useState<any[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    // Form fields
    const [componentType, setComponentType] = useState('SCREEN');
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null); // This can be deviceId or subCategoryId
    const [compatibleModels, setCompatibleModels] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [compRes, devRes, subRes, brandRes] = await Promise.all([
                apiClient.get('/admin/compatibility'),
                apiClient.get('/admin/devices'),
                apiClient.get('/admin/component-sub-categories'),
                apiClient.get('/admin/device-types')
            ]);
            setCompatibilities(compRes.data.data || []);
            setDevices(devRes.data.data || []);
            setSubCategories(subRes.data.data || []);
            setDeviceTypes(brandRes.data.data || []);
        } catch (error) {
            console.error(error);
            Toast.error('Failed to load compatibility mappings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedId || !compatibleModels) return;
        try {
            const modelsArray = compatibleModels.split(',').map(m => m.trim()).filter(Boolean);
            const isSubCatType = ['IC', 'CONNECTOR', 'ADHESIVE'].includes(componentType);

            const payload = {
                componentType,
                [isSubCatType ? 'subCategoryId' : 'deviceId']: selectedId,
                compatibleModels: modelsArray
            };
            if (editingId) {
                await apiClient.put(`/admin/compatibility/${editingId}`, payload);
            } else {
                await apiClient.post('/admin/compatibility', payload);
            }
            setModalVisible(false);
            fetchData();
            Toast.success('Compatibility mapping saved');
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to save mapping');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/compatibility/${id}`);
            Toast.success('Mapping deleted');
            fetchData();
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to delete mapping');
        }
    };

    const filteredCompatibilities = compatibilities.filter(c => {
        if (filterType !== 'ALL' && c.componentType !== filterType) return false;
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        const targetName = c.device?.name || c.subCategory?.name || `ID:${c.id}`;
        return (
            c.componentType.toLowerCase().includes(q) ||
            targetName.toLowerCase().includes(q) ||
            String(c.compatibleModels).toLowerCase().includes(q)
        );
    });

    const isSubCatType = ['IC', 'CONNECTOR', 'ADHESIVE'].includes(componentType);
    const selectionList = isSubCatType
        ? subCategories.filter(s => s.componentType === componentType)
        : (selectedBrandId 
            ? devices.filter(d => (d as any).deviceTypeId === selectedBrandId)
            : devices);

    const filteredSelection = selectionList.filter((item: any) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const getDisplayModels = (rawValue: any): string => {
        if (Array.isArray(rawValue)) return rawValue.join(', ');
        if (typeof rawValue === 'string') return rawValue;
        return JSON.stringify(rawValue);
    };

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>Compatibility Table</Text>
                    <Text style={styles.subtitle}>Manage component cross-compatibility between hardware devices.</Text>
                </View>
                <Pressable onPress={() => { setEditingId(null); setComponentType('SCREEN'); setCompatibleModels(''); setSelectedId(null); setSelectedBrandId(null); setItemSearch(''); setModalVisible(true); }} style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}>
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Create Mapping</Text>
                </Pressable>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
                    {['ALL', 'SCREEN', 'BATTERY', 'IC', 'CONNECTOR', 'ADHESIVE'].map((type) => (
                        <Pressable
                            key={type}
                            onPress={() => setFilterType(type)}
                            style={[styles.filterPill, filterType === type && styles.activeFilterPill]}
                        >
                            <Text style={[styles.filterPillText, filterType === type && styles.activeFilterPillText]}>{type}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Search bar */}
            <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by type, device or compatible models..."
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

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={filteredCompatibilities}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No results found.</Text></View>}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeText}>{item.componentType}</Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => {
                                        setEditingId(item.id);
                                        setComponentType(item.componentType);
                                        const brandId = item.device?.deviceTypeId || null;
                                        setSelectedBrandId(brandId);
                                        setSelectedId(item.subCategoryId || item.deviceId);
                                        setCompatibleModels(getDisplayModels(item.compatibleModels));
                                        setItemSearch('');
                                        setModalVisible(true);
                                    }}>
                                        <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.mainModel}>
                                For: {item.subCategory?.name || item.device?.name || `ID: ${item.id}`}
                                {item.device?.deviceType?.name ? ` (${item.device.deviceType.name})` : ''}
                            </Text>
                            <View style={styles.divider} />
                            <Text style={styles.compatTitle}>Compatible with:</Text>
                            <Text style={styles.compatList}>{getDisplayModels(item.compatibleModels)}</Text>
                        </Animated.View>
                    )}
                />
            )}

            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, !isDesktop && { width: '92%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit Mapping' : 'Add New Mapping'}</Text>

                        <Text style={styles.label}>Component Type</Text>
                        <View style={styles.catPicker}>
                            {[
                                { value: 'SCREEN', label: 'Screen' },
                                { value: 'BATTERY', label: 'Battery' },
                                { value: 'IC', label: 'IC Chip' },
                                { value: 'CONNECTOR', label: 'Connector' },
                                { value: 'ADHESIVE', label: 'Adhesive' },
                            ].map(({ value, label }) => (
                                <Pressable
                                    key={value}
                                    onPress={() => { setComponentType(value); setSelectedId(null); setSelectedBrandId(null); }}
                                    style={[styles.catBtn, componentType === value && styles.activeCatBtn]}
                                >
                                    <Text style={[styles.catBtnText, componentType === value && styles.activeCatBtnText]}>{label}</Text>
                                </Pressable>
                            ))}
                        </View>

                        {!isSubCatType && (
                            <>
                                <Text style={styles.label}>Select Brand</Text>
                                <View style={[styles.catPicker, { flexWrap: 'wrap', marginBottom: 16 }]}>
                                    {deviceTypes.map((brand) => (
                                        <Pressable
                                            key={brand.id}
                                            onPress={() => { setSelectedBrandId(brand.id); setSelectedId(null); }}
                                            style={[styles.brandPill, selectedBrandId === brand.id && styles.activeBrandPill]}
                                        >
                                            <Text style={[styles.brandPillText, selectedBrandId === brand.id && styles.activeBrandPillText]}>
                                                {brand.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}

                        {(isSubCatType || selectedBrandId) && (
                            <>
                                <Text style={styles.label}>{isSubCatType ? 'Select Sub-Category' : 'Base Device'}</Text>
                                {/* Search */}
                                <View style={styles.inlineSearch}>
                                    <Ionicons name="search-outline" size={14} color="#94A3B8" />
                                    <TextInput
                                        style={styles.inlineSearchInput}
                                        placeholder="Search item..."
                                        placeholderTextColor="#94A3B8"
                                        value={itemSearch}
                                        onChangeText={setItemSearch}
                                    />
                                </View>
                                <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
                                    {filteredSelection.map((item: any) => (
                                        <Pressable
                                            key={item.id}
                                            onPress={() => setSelectedId(item.id)}
                                            style={[styles.selectItem, selectedId === item.id && styles.activeSelect]}
                                        >
                                            <Text style={selectedId === item.id && { color: '#FB5507', fontWeight: 'bold' }}>
                                                {item.name} {item.deviceType?.name ? `(${item.deviceType.name})` : ''}
                                            </Text>
                                        </Pressable>
                                    ))}
                                    {filteredSelection.length === 0 && (
                                        <Text style={{ color: '#94A3B8', padding: 10, textAlign: 'center' }}>No items found</Text>
                                    )}
                                </ScrollView>
                            </>
                        )}

                        <Text style={styles.label}>Compatible Devices (Separated by comma)</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                            placeholder="e.g. iPhone 16 Plus, iPhone 16 Pro"
                            multiline
                            value={compatibleModels}
                            onChangeText={setCompatibleModels}
                        />

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSave} style={[styles.button, styles.saveBtn]}><Text style={styles.saveBtnText}>Save Mapping</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    addButton: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    filterContainer: { marginBottom: 16 },
    filterList: { gap: 8 },
    filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
    activeFilterPill: { backgroundColor: '#FB5507', borderColor: '#FB5507' },
    filterPillText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
    activeFilterPillText: { color: '#FFF' },
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, marginBottom: 20, height: 46 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
    list: { gap: 16, paddingBottom: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typeBadge: { backgroundColor: '#FDF2F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    typeText: { color: '#FB5507', fontSize: 12, fontWeight: 'bold' },
    actions: { flexDirection: 'row', gap: 16 },
    mainModel: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    compatTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
    compatList: { fontSize: 14, color: '#475569', lineHeight: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', width: 500, borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
    catPicker: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
    catBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 15, backgroundColor: '#F1F5F9' },
    activeCatBtn: { backgroundColor: '#FB5507' },
    catBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    activeCatBtnText: { color: '#FFF' },
    inlineSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 10, marginBottom: 8, height: 36, gap: 6 },
    inlineSearchInput: { flex: 1, fontSize: 13, color: '#1E293B' },
    selectItem: { padding: 10, borderRadius: 8, marginBottom: 4, backgroundColor: '#F8FAFC' },
    activeSelect: { backgroundColor: '#FDF2F0', borderWidth: 1, borderColor: '#FB5507' },
    brandPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 15, backgroundColor: '#F1F5F9', marginRight: 8 },
    activeBrandPill: { backgroundColor: '#FB5507' },
    brandPillText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    activeBrandPillText: { color: '#FFF' },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
    button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#FB5507' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
});
