import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getDashboardStats, DashboardStats } from '../../api/dashboardApi';

export default function DashboardScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers.toLocaleString() || '0', icon: 'people', color: '#3B82F6' },
        { label: 'Pending Orders', value: stats?.pendingOrders.toLocaleString() || '0', icon: 'time', color: '#F59E0B' },
        { label: 'Completed Orders', value: stats?.completedOrders.toLocaleString() || '0', icon: 'checkmark-circle', color: '#10B981' },
        { label: 'Revenue', value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '$0', icon: 'cash', color: '#8B5CF6' },
    ];

    return (
        <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
            }
        >
            <Animated.View entering={FadeIn.duration(800)}>
                <Text style={styles.headerTitle}>Dashboard Overview</Text>
                <Text style={styles.headerSubtitle}>Monitor your system performance and user activity.</Text>

                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color="#FB5507" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={styles.statsGrid}>
                    {statCards.map((stat, index) => (
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

                <View style={[styles.row, !isDesktop && { flexDirection: 'column' }]}>
                    <View style={[styles.largeCard, !isDesktop && { minWidth: '100%' }]}>
                        <Text style={styles.cardTitle}>Recent Orders</Text>
                        <View style={styles.divider} />
                        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map((order) => (
                                <View key={order.id} style={styles.listItem}>
                                    <View style={styles.listAvatar}>
                                        <Text style={styles.avatarText}>{order.user.username.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.listTextContent}>
                                        <Text style={styles.listMainText} numberOfLines={1}>{order.service.title}</Text>
                                        <Text style={styles.listSubText} numberOfLines={1}>by {order.user.username} • {new Date(order.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusPill,
                                        { backgroundColor: order.status === 'SUCCESSFUL' ? '#ECFDF5' : order.status === 'FAILED' ? '#FEF2F2' : '#FFFBEB' }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: order.status === 'SUCCESSFUL' ? '#10B981' : order.status === 'FAILED' ? '#FB5507' : '#F59E0B' }
                                        ]}>
                                            {order.status}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No recent orders found.</Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.smallCard, !isDesktop && { minWidth: '100%' }]}>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748B',
        fontSize: 14,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 14,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
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
        minWidth: 300,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    smallCard: {
        flex: 1,
        minWidth: 260,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
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
