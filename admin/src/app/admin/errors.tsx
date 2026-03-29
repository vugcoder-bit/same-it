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
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

interface ErrorLog {
    id: number;
    errorCode: string;
    description: string;
    solution: string;
}

export default function ErrorLogsManagementScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [logs, setLogs] = useState<ErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // Form fields
    const [errorCode, setErrorCode] = useState('');
    const [description, setDescription] = useState('');
    const [solution, setSolution] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/errors');
            setLogs(response.data.data || []);
        } catch (error) {
            console.error(error);
            Toast.error('Failed to load error codes');
        }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!errorCode || !description || !solution) return;
        try {
            setSaving(true);
            const payload = { errorCode, description, solution };
            if (editingId) {
                await apiClient.put(`/admin/errors/${editingId}`, payload);
            } else {
                await apiClient.post('/admin/errors', payload);
            }
            setModalVisible(false);
            fetchLogs();
            Toast.success('Error code saved successfully');
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to save error code');
        }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/errors/${id}`);
            Toast.success('Error code deleted');
            fetchLogs();
        } catch (error: any) {
            console.error(error);
            Toast.error('Failed to delete error code');
        }
    };

    const filteredLogs = logs.filter(l =>
        l.errorCode.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, !isDesktop && styles.responsiveContainer]}>
            <View style={[styles.header, !isDesktop && styles.mobileHeader]}>
                <View>
                    <Text style={[styles.title, !isDesktop && styles.mobileTitle]}>Repair Error Codes</Text>
                    <Text style={styles.subtitle}>Reference guide for device hardware and software error codes.</Text>
                </View>
                <Pressable onPress={() => { setEditingId(null); setErrorCode(''); setDescription(''); setSolution(''); setModalVisible(true); }} style={[styles.addButton, !isDesktop && styles.mobileAddButton]}>
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Error Code</Text>
                </Pressable>
            </View>

            <View style={styles.searchRow}>
                <View style={[styles.searchBar, !isDesktop && styles.mobileSearchBar]}>
                    <Ionicons name="search" size={20} color="#64748B" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by error code or description..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={filteredLogs}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={isDesktop ? 2 : 1}
                    columnWrapperStyle={isDesktop ? { gap: 20 } : undefined}
                    contentContainerStyle={styles.list}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.codeText}>{item.errorCode}</Text>
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => {
                                        setEditingId(item.id);
                                        setErrorCode(item.errorCode);
                                        setDescription(item.description);
                                        setSolution(item.solution);
                                        setModalVisible(true);
                                    }}>
                                        <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.descTitle}>Description</Text>
                            <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.solutionTitle}>Recommended Solution</Text>
                            <Text style={styles.solutionText} numberOfLines={3}>{item.solution}</Text>
                        </Animated.View>
                    )}
                />
            )}

            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, !isDesktop && { width: '90%', padding: 20 }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Error Documentation</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Error Code</Text>
                            <TextInput style={styles.input} value={errorCode} onChangeText={setErrorCode} placeholder="e.g. ERR_001" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} placeholder="Briefly describe the error..." />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Repair Solution</Text>
                            <TextInput style={[styles.input, { height: 120 }]} multiline value={solution} onChangeText={setSolution} placeholder="Provide step-by-step fix..." />
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSave} style={[styles.button, styles.saveBtn]} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Solution</Text>}
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
    responsiveContainer: { padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    mobileHeader: { flexDirection: 'column', alignItems: 'flex-start', gap: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    mobileTitle: { fontSize: 20 },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    addButton: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
    mobileAddButton: { width: '100%', justifyContent: 'center' },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    searchRow: { marginBottom: 24 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#E2E8F0', maxWidth: 400 },
    mobileSearchBar: { maxWidth: '100%' },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
    list: { gap: 20 },
    card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 220 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    codeText: { fontSize: 18, fontWeight: 'bold', color: '#FB5507', backgroundColor: '#FDF2F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    actions: { flexDirection: 'row', gap: 16 },
    descTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
    descText: { fontSize: 14, color: '#1E293B', marginBottom: 16, lineHeight: 20 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
    solutionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6A994E', textTransform: 'uppercase', marginBottom: 4 },
    solutionText: { fontSize: 14, color: '#475569', lineHeight: 22 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', width: 550, borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: 'top' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
    button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#FB5507' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
