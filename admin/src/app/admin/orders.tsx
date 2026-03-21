import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Pressable, 
    ActivityIndicator, TouchableOpacity, FlatList,
    useWindowDimensions, Modal, Platform, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import { Toast } from 'toastify-react-native';
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface Order {
    id: number;
    userId: number;
    user?: { username: string };
    serviceId: number;
    service?: { title: string };
    paymentMethod?: { title: string };
    status: 'PROCESSING' | 'SUCCESSFUL' | 'FAILED';
    createdAt: string;
    totalPrice: number;
    quantity: number;
    phone1: string;
    phone2?: string;
    telegramUsername?: string;
    serialNumber?: string;
    notes?: string;
    paymentScreenshot?: string;
    adminNotes?: string;
    adminFileUrl?: string;
}

export default function OrdersManagementScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED'>('ALL');
    
    // Details Modal
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [adminFile, setAdminFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/orders');
            setOrders(response.data.data || []);
        } catch (error) { 
            console.error(error); 
            Toast.error('Failed to load orders');
        }
        finally { setLoading(false); }
    };

    const updateStatus = async (id: number, status: 'SUCCESSFUL' | 'FAILED') => {
        try {
            setUpdating(true);
            const formData = new FormData();
            formData.append('status', status);
            
            if (adminNotes) {
                formData.append('adminNotes', adminNotes);
            }
            
            if (adminFile && !adminFile.canceled) {
                const asset = adminFile.assets[0];
                if (Platform.OS === 'web') {
                    const response = await fetch(asset.uri);
                    const blob = await response.blob();
                    formData.append('adminFile', blob, asset.name);
                } else {
                    formData.append('adminFile', {
                        uri: asset.uri,
                        name: asset.name,
                        type: asset.mimeType || 'application/octet-stream',
                    } as any);
                }
            }

            await apiClient.put(`/admin/orders/${id}/status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Toast.success(`Order status updated to ${status}`);
            setSelectedOrder(null);
            setAdminNotes('');
            setAdminFile(null);
            fetchOrders();
        } catch (error: any) { 
            console.error(error); 
            Toast.error('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                setAdminFile(result);
            }
        } catch (error) { console.error(error); }
    };

    const filteredOrders = orders.filter(o => 
        filter === 'ALL' ? true : o.status === filter
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'SUCCESSFUL': return { bg: '#F0FDF4', text: '#22C55E' };
            case 'FAILED': return { bg: '#FEF2F2', text: '#EF4444' };
            default: return { bg: '#FFFBEB', text: '#F59E0B' };
        }
    };

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>Service Orders Queue</Text>
                    <Text style={styles.subtitle}>Review and process service requests from technicians.</Text>
                </View>
                <View style={[styles.filterBar, !isDesktop && { width: '100%', overflow: 'scroll' }]}>
                    {(['ALL', 'PROCESSING', 'SUCCESSFUL', 'FAILED'] as const).map(f => (
                        <Pressable 
                            key={f} 
                            onPress={() => setFilter(f)}
                            style={[styles.filterBtn, filter === f && styles.activeFilter]}
                        >
                            <Text style={[styles.filterBtnText, filter === f && styles.activeFilterText]}>{f}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#E8632B" /></View>
            ) : (
                <View style={styles.tableCard}>
                    <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false}>
                        <View style={!isDesktop ? { width: 1000 } : { flex: 1 }}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.col, { flex: 0.5 }]}>ID</Text>
                                <Text style={[styles.col, { flex: 1.5 }]}>Technician</Text>
                                <Text style={[styles.col, { flex: 2 }]}>Service</Text>
                                <Text style={[styles.col, { flex: 1 }]}>Total</Text>
                                <Text style={[styles.col, { flex: 1 }]}>Payment</Text>
                                <Text style={[styles.col, { flex: 1 }]}>Status</Text>
                                <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>Actions</Text>
                            </View>

                            <FlatList
                                data={filteredOrders}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item, index }) => {
                                    const styles_status = getStatusStyle(item.status);
                                    return (
                                        <Animated.View entering={FadeInRight.delay(index * 30)} style={styles.row}>
                                            <Text style={[styles.cellText, { flex: 0.5 }]}>#{item.id}</Text>
                                            <View style={[styles.cellView, { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                                                <View style={styles.avatar}><Text style={styles.avatarText}>{item.user?.username?.charAt(0).toUpperCase() || 'U'}</Text></View>
                                                <Text style={styles.userName}>{item.user?.username || 'Unknown'}</Text>
                                            </View>
                                            <Text style={[styles.cellText, { flex: 2, fontWeight: '600' }]}>{item.service?.title || 'Unknown Service'}</Text>
                                            <Text style={[styles.cellText, { flex: 1, fontWeight: 'bold', color: '#E8632B' }]}>${item.totalPrice}</Text>
                                            <Text style={[styles.cellText, { flex: 1, fontSize: 12 }]}>{item.paymentMethod?.title || 'Direct'}</Text>
                                            <View style={[styles.cellView, { flex: 1 }]}>
                                                <View style={[styles.pill, { backgroundColor: styles_status.bg }]}>
                                                    <Text style={[styles.pillText, { color: styles_status.text }]}>{item.status}</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.cellView, { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }]}>
                                                <TouchableOpacity onPress={() => { setSelectedOrder(item); setAdminNotes(''); setAdminFile(null); }} style={styles.actionIcon}>
                                                    <Ionicons name="eye-outline" size={22} color="#E8632B" />
                                                </TouchableOpacity>
                                            </View>
                                        </Animated.View>
                                    );
                                }}
                            />
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Order Details Modal */}
            <Modal transparent visible={!!selectedOrder} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.detailsModal, { width: isDesktop ? 600 : '95%' }]}>
                        <View style={styles.detailsHeader}>
                            <Text style={styles.modalTitle}>Order Details #{selectedOrder?.id}</Text>
                            <TouchableOpacity onPress={() => setSelectedOrder(null)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.detailsScroll}>
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Technician</Text><Text style={styles.detailValue}>{selectedOrder?.user?.username}</Text></View>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Service</Text><Text style={styles.detailValue}>{selectedOrder?.service?.title || 'Unknown Service'}</Text></View>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Quantity</Text><Text style={styles.detailValue}>{selectedOrder?.quantity}</Text></View>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Total Price</Text><Text style={[styles.detailValue, { color: '#E8632B', fontWeight: 'bold' }]}>${selectedOrder?.totalPrice}</Text></View>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Payment Method</Text><Text style={styles.detailValue}>{selectedOrder?.paymentMethod?.title || 'Unknown'}</Text></View>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Date Added</Text><Text style={styles.detailValue}>{selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : ''}</Text></View>
                                <View style={styles.detailItem}><Text style={styles.detailLabel}>Phone 1</Text><Text style={styles.detailValue}>{selectedOrder?.phone1}</Text></View>
                                {selectedOrder?.phone2 ? <View style={styles.detailItem}><Text style={styles.detailLabel}>Phone 2</Text><Text style={styles.detailValue}>{selectedOrder?.phone2}</Text></View> : null}
                                {selectedOrder?.telegramUsername ? <View style={styles.detailItem}><Text style={styles.detailLabel}>Telegram</Text><Text style={styles.detailValue}>{selectedOrder?.telegramUsername}</Text></View> : null}
                                {selectedOrder?.serialNumber ? <View style={styles.detailItem}><Text style={styles.detailLabel}>Serial Number</Text><Text style={styles.detailValue}>{selectedOrder?.serialNumber}</Text></View> : null}
                            </View>

                            {selectedOrder?.notes && (
                                <View style={styles.noteBox}>
                                    <Text style={styles.detailLabel}>User Notes</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.notes}</Text>
                                </View>
                            )}

                            <Text style={[styles.detailLabel, { marginTop: 20 }]}>Payment Screenshot</Text>
                            {selectedOrder?.paymentScreenshot ? (
                                <Image 
                                    source={{ uri: `${apiClient.defaults.baseURL?.replace('/api', '')}/uploads/payments/${selectedOrder.paymentScreenshot.split('/').pop()}` }} 
                                    style={styles.screenshot} 
                                    contentFit="contain"
                                />
                            ) : (
                                <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>No screenshot provided</Text>
                            )}
                            
                            {selectedOrder?.status !== 'SUCCESSFUL' && (
                                <View style={styles.adminSection}>
                                    <Text style={styles.adminSectionTitle}>Admin Approval Actions</Text>
                                    
                                    <Text style={styles.detailLabel}>Additional Notes (Optional, sent to user)</Text>
                                    <TextInput 
                                        style={[styles.input, styles.textArea]} 
                                        placeholder="e.g., Download link or setup instructions..." 
                                        value={adminNotes} 
                                        onChangeText={setAdminNotes} 
                                        multiline 
                                    />
                                    
                                    <Text style={styles.detailLabel}>Additional File (Optional)</Text>
                                    <Pressable onPress={pickDocument} style={styles.filePicker}>
                                        <Ionicons name="document-attach" size={24} color={adminFile ? '#10B981' : '#94A3B8'} />
                                        <Text style={styles.filePickerText}>
                                            {adminFile && !adminFile.canceled ? adminFile.assets[0].name : 'Choose specific software or tool file...'}
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </ScrollView>

                        {selectedOrder?.status !== 'SUCCESSFUL' && selectedOrder?.status !== 'FAILED' && (
                            <View style={styles.modalFooter}>
                                <TouchableOpacity onPress={() => updateStatus(selectedOrder!.id, 'FAILED')} disabled={updating} style={[styles.statusBtn, styles.failBtn]}>
                                    <Text style={styles.btnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => updateStatus(selectedOrder!.id, 'SUCCESSFUL')} disabled={updating} style={[styles.statusBtn, styles.successBtn]}>
                                    {updating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Approve & Complete</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    filterBar: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, gap: 4 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    activeFilter: { backgroundColor: '#FFF', elevation: 2 },
    filterBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
    activeFilterText: { color: '#E8632B' },
    tableCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', padding: 20, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    col: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    cellText: { fontSize: 14, color: '#1E293B' },
    cellView: { },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    userName: { fontWeight: '500' },
    pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pillText: { fontSize: 10, fontWeight: 'bold' },
    actionIcon: { padding: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    detailsModal: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '90%' },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    detailsScroll: { flexShrink: 1, width: '100%' },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
    detailItem: { width: '45%' },
    detailLabel: { fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 4 },
    detailValue: { fontSize: 15, color: '#1E293B' },
    noteBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginTop: 16 },
    screenshot: { width: '100%', height: 300, borderRadius: 12, marginTop: 10, backgroundColor: '#F1F5F9' },
    modalFooter: { flexDirection: 'row', gap: 12, marginTop: 24 },
    statusBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    successBtn: { backgroundColor: '#22C55E' },
    failBtn: { backgroundColor: '#EF4444' },
    adminSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    adminSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, backgroundColor: '#FFF' },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    filePicker: { height: 50, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, backgroundColor: '#F8FAFC' },
    filePickerText: { color: '#64748B', fontSize: 14 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
