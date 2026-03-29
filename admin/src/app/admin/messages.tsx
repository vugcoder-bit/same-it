import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { apiClient } from '@/api/apiClient';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export default function MessagesScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/contact');
            setMessages(res.data.data || []);
        } catch (e) {
            Toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 22 }]}>Contact Messages</Text>
                    <Text style={styles.subtitle}>View messages sent by users from the mobile app.</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#94A3B8' }}>No messages yet.</Text></View>}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.email}>{item.email}</Text>
                                </View>
                                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                            </View>
                            <View style={styles.messageBox}>
                                <Text style={styles.messageText}>{item.message}</Text>
                            </View>
                        </Animated.View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { marginBottom: 24 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    list: { gap: 16, paddingBottom: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    email: { fontSize: 14, color: '#FB5507', marginTop: 2 },
    date: { fontSize: 12, color: '#94A3B8' },
    messageBox: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12 },
    messageText: { fontSize: 15, color: '#334155', lineHeight: 22 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
});
