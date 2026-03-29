import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, ActivityIndicator, Modal, TouchableOpacity,
    FlatList, useWindowDimensions
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface PaymentMethod {
    id: number;
    title: string;
    accountNumber: string;
    color: string;
    note?: string;
}

export default function PaymentMethodsScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [color, setColor] = useState('#FB5507');
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/payment-methods');
            setMethods(res.data.data || []);
        } catch (error) {
            Toast.error('Failed to load payment methods');
        } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!title || !accountNumber) return;
        try {
            setSaving(true);
            const payload = { title, accountNumber, color, note };
            if (editingId) {
                await apiClient.put(`/admin/payment-methods/${editingId}`, payload);
            } else {
                await apiClient.post('/admin/payment-methods', payload);
            }
            setModalVisible(false);
            fetchMethods();
            Toast.success('Payment method saved');
        } catch (error) { Toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/payment-methods/${id}`);
            Toast.success('Deleted');
            fetchMethods();
        } catch (error) { Toast.error('Failed to delete'); }
    };

    const colors = ['#FB5507', '#3B82F6', '#22C55E', '#8B5CF6', '#F43F5E', '#64748B'];

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>Payment Methods</Text>
                    <Text style={styles.subtitle}>Configure accounts for receiving payments.</Text>
                </View>
                <Pressable
                    onPress={() => { setEditingId(null); setTitle(''); setAccountNumber(''); setNote(''); setColor('#FB5507'); setModalVisible(true); }}
                    style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Method</Text>
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={methods}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={isDesktop ? 3 : 1}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInRight.delay(index * 50)} style={[styles.card, { borderLeftColor: item.color, borderLeftWidth: 5 }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.methodTitle, { color: item.color }]}>{item.title}</Text>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity onPress={() => { setEditingId(item.id); setTitle(item.title); setAccountNumber(item.accountNumber); setNote(item.note || ''); setColor(item.color); setModalVisible(true); }}>
                                        <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#FB5507" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.accountNumber}>{item.accountNumber}</Text>
                            {item.note && <Text style={styles.note}>{item.note}</Text>}
                        </Animated.View>
                    )}
                />
            )}

            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: isDesktop ? 400 : '95%' }]}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Payment Method</Text>
                        <TextInput style={styles.input} placeholder="Title (e.g. ZainCash, Bank Transfer)" value={title} onChangeText={setTitle} />
                        <TextInput style={styles.input} placeholder="Account Number / Detail" value={accountNumber} onChangeText={setAccountNumber} />
                        <TextInput style={[styles.input, { height: 60 }]} multiline placeholder="Optional Note" value={note} onChangeText={setNote} />

                        <Text style={styles.label}>Identify Color</Text>
                        <View style={styles.colorPicker}>
                            {colors.map(c => (
                                <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.activeColor]} />
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelBtn]}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={handleSave} style={[styles.button, styles.saveBtn]} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    addButton: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, margin: 8, flex: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    methodTitle: { fontSize: 18, fontWeight: 'bold' },
    cardActions: { flexDirection: 'row', gap: 12 },
    accountNumber: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
    note: { fontSize: 13, color: '#64748B', marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { height: 48, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
    colorPicker: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    colorCircle: { width: 36, height: 36, borderRadius: 18 },
    activeColor: { borderWidth: 3, borderColor: '#CBD5E1' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    cancelBtn: { backgroundColor: '#F1F5F9' },
    saveBtn: { backgroundColor: '#FB5507' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
