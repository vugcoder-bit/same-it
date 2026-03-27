import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Pressable, 
    TextInput, ActivityIndicator, Modal, TouchableOpacity,
    useWindowDimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';
import { Toast } from 'toastify-react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

interface User {
    id: number;
    username: string;
    role: string;
    subscriptionExpireDate: string | null;
    createdAt: string;
}

export default function UsersScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    // Form fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [expiry, setExpiry] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users');
            // Assuming response looks like { success: true, data: [...] }
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            Toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!username || (!editingUser && !password)) return;
        
        try {
            setSaving(true);
            const payload = {
                username,
                ...(password ? { password } : {}),
                subscriptionExpireDate: expiry || null,
            };

            if (editingUser) {
                await apiClient.put(`/admin/users/${editingUser.id}`, payload);
            } else {
                await apiClient.post('/admin/users', payload);
            }
            
            setModalVisible(false);
            resetForm();
            fetchUsers();
            Toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
        } catch (error: any) {
            console.error('Error saving user:', error);
            Toast.error(error.response?.data?.message || 'Error saving user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/users/${id}`);
            Toast.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            Toast.error(error.response?.data?.message || 'Error deleting user');
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setUsername(user.username);
        setPassword('');
        setExpiry(user.subscriptionExpireDate || '');
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setExpiry('');
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const isExpired = (date: string | null) => {
        if (!date) return true;
        return new Date(date) < new Date();
    };

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 24 }]}>User Management</Text>
                    <Text style={styles.subtitle}>Manage system users and their service subscriptions.</Text>
                </View>
                <Pressable 
                    onPress={() => { setEditingUser(null); setUsername(''); setModalVisible(true); }} 
                    style={[styles.addButton, !isDesktop && { width: '100%', justifyContent: 'center' }]}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add New User</Text>
                </Pressable>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                    placeholder="Search by username..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#E8632B" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.columnHeader, { flex: 2 }]}>Username</Text>
                        <Text style={[styles.columnHeader, { flex: 1 }]}>Status</Text>
                        <Text style={[styles.columnHeader, { flex: 1.5 }]}>Subscription</Text>
                        <Text style={[styles.columnHeader, { flex: 1 }]}>Actions</Text>
                    </View>

                    {filteredUsers.map((user, index) => (
                        <Animated.View 
                            key={user.id} 
                            entering={FadeInUp.delay(index * 50)}
                            layout={Layout.springify()}
                            style={styles.row}
                        >
                            <Text style={[styles.cell, { flex: 2, fontWeight: '600' }]}>{user.username}</Text>
                            <View style={{ flex: 1 }}>
                                <View style={[
                                    styles.pill, 
                                    { backgroundColor: isExpired(user.subscriptionExpireDate) ? '#FEF2F2' : '#F0FDF4' }
                                ]}>
                                    <Text style={[
                                        styles.pillText, 
                                        { color: isExpired(user.subscriptionExpireDate) ? '#EF4444' : '#22C55E' }
                                    ]}>
                                        {isExpired(user.subscriptionExpireDate) ? 'Inactive' : 'Active'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.cell, { flex: 1.5, color: '#64748B' }]}>
                                {user.subscriptionExpireDate ? new Date(user.subscriptionExpireDate).toLocaleDateString() : 'N/A'}
                            </Text>
                            <View style={[styles.actions, { flex: 1 }]}>
                                <TouchableOpacity onPress={() => openEditModal(user)}>
                                    <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(user.id)}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </ScrollView>
            )}

            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={FadeInUp} style={[styles.modalContent, !isDesktop && { width: '90%', padding: 20 }]}>
                            <Text style={styles.modalTitle}>
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </Text>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Username"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {editingUser ? 'New Password (leave empty to keep same)' : 'Password'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subscription Expiry</Text>
                                {Platform.OS === 'web' ? (
                                    <input 
                                        type="date"
                                        style={{
                                            height: 48,
                                            borderWidth: 1,
                                            borderColor: '#E2E8F0',
                                            borderRadius: 10,
                                            paddingHorizontal: 12,
                                            fontSize: 15,
                                            width: '100%',
                                            fontFamily: 'inherit'
                                        }}
                                        value={expiry ? new Date(expiry).toISOString().split('T')[0] : ''}
                                        onChange={(e: any) => setExpiry(e.target.value ? new Date(e.target.value).toISOString() : '')}
                                    />
                                ) : (
                                    <TextInput
                                        style={styles.input}
                                        value={expiry}
                                        onChangeText={setExpiry}
                                        placeholder="YYYY-MM-DD"
                                    />
                                )}
                            </View>

                            <View style={styles.modalButtons}>
                                <Pressable 
                                    onPress={() => setModalVisible(false)} 
                                    style={[styles.button, styles.cancelButton]}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={handleSave} 
                                    style={[styles.button, styles.saveButton]}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save User</Text>}
                                </Pressable>
                            </View>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#E8632B',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },
    tableContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    columnHeader: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cell: {
        fontSize: 14,
        color: '#1E293B',
    },
    pill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pillText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        width: 400,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 10,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
    },
    saveButton: {
        backgroundColor: '#E8632B',
        minWidth: 100,
    },
    cancelButtonText: {
        color: '#64748B',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});
