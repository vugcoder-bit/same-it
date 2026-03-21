import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function DashboardScreen() {
    const stats = [
        { label: 'Total Users', value: '1,284', icon: 'people', color: '#3B82F6' },
        { label: 'Pending Orders', value: '42', icon: 'time', color: '#F59E0B' },
        { label: 'Completed Orders', value: '892', icon: 'checkmark-circle', color: '#10B981' },
        { label: 'Revenue', value: '$12,450', icon: 'cash', color: '#8B5CF6' },
    ];

    return (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Animated.View entering={FadeIn.duration(800)}>
                <Text style={styles.headerTitle}>Dashboard Overview</Text>
                <Text style={styles.headerSubtitle}>Monitor your system performance and user activity.</Text>
                
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.iconContainer, { backgroundColor: stat.color + '10' }]}>
                                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.row}>
                    <View style={styles.largeCard}>
                        <Text style={styles.cardTitle}>Recent Orders</Text>
                        <View style={styles.divider} />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <View key={i} style={styles.listItem}>
                                <View style={styles.listAvatar}>
                                    <Text style={styles.avatarText}>U</Text>
                                </View>
                                <View style={styles.listTextContent}>
                                    <Text style={styles.listMainText}>Order #293{i} - Windows 10 Key</Text>
                                    <Text style={styles.listSubText}>2 minutes ago</Text>
                                </View>
                                <View style={styles.statusPill}>
                                    <Text style={styles.statusText}>Success</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    
                    <View style={styles.smallCard}>
                        <Text style={styles.cardTitle}>System Status</Text>
                        <View style={styles.divider} />
                        <View style={styles.statusItem}>
                            <Text style={styles.statusLabel}>Backend API</Text>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusLabel}>Database (MySQL)</Text>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusLabel}>Storage (Multer)</Text>
                            <View style={styles.onlineIndicator} />
                        </View>
                    </View>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
        marginBottom: 32,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        minWidth: 240,
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    largeCard: {
        flex: 2,
        minWidth: 400,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    smallCard: {
        flex: 1,
        minWidth: 300,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#64748B',
    },
    listTextContent: {
        flex: 1,
    },
    listMainText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    listSubText: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    statusPill: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
    },
    statusItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statusLabel: {
        fontSize: 14,
        color: '#475569',
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
});
