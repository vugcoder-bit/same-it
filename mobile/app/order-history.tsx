import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { useLocale } from '@/hooks/use-locale';
import { AppHeader } from '@/components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Linking } from 'react-native';
import { Toast } from 'toastify-react-native';

const fetchMyOrders = async () => {
    const { data } = await apiClient.get('/orders/my');
    return data;
};

export default function OrderHistoryScreen() {
    const { t } = useLocale();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['myOrders'],
        queryFn: fetchMyOrders
    });

    const renderItem = ({ item }: { item: any }) => {
        const isSuccessful = item.status === 'SUCCESSFUL';
        const isFailed = item.status === 'FAILED';
        const isProcessing = item.status === 'PROCESSING';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>{t('orderId')}: #{item.id}</Text>
                    <View style={[
                        styles.statusBadge, 
                        isSuccessful ? styles.successBg : isFailed ? styles.failBg : styles.processingBg
                    ]}>
                        <Text style={styles.statusText}>
                            {isSuccessful ? t('orderSuccessful') : isFailed ? t('orderFailed') : t('orderProcessing')}
                        </Text>
                    </View>
                </View>

                <View style={styles.dateRow}>
                    <Text style={styles.dateText}>📅 {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.itemTitle}>{item.service?.title || 'Service'}</Text>
                    <Text style={styles.itemCount}>{item.quantity || 1} PCS</Text>
                    <Text style={styles.itemPrice}>${item.totalPrice || 0}</Text>
                </View>

                {item.paymentMethod && (
                    <Text style={styles.pmText}>{t('paymentMethod')}: {item.paymentMethod.title}</Text>
                )}

                {item.adminNotes && (
                    <View style={styles.adminNotesContainer}>
                        <Text style={styles.adminNotesLabel}>{t('adminNotes') || 'Admin Notes'}</Text>
                        <View style={styles.adminNotesRow}>
                            <Text style={styles.adminNotesText}>{item.adminNotes}</Text>
                            <TouchableOpacity onPress={async () => {
                                await Clipboard.setStringAsync(item.adminNotes);
                                Toast.success(t('copied') || 'Copied to clipboard');
                            }} style={styles.copyBtn}>
                                <Ionicons name="copy-outline" size={18} color="#E8632B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {item.adminFileUrl && (
                    <TouchableOpacity 
                        style={styles.downloadBtn} 
                        onPress={() => Linking.openURL(item.adminFileUrl)}
                    >
                        <Ionicons name="download-outline" size={18} color="#FFF" />
                        <Text style={styles.downloadBtnText}>{t('downloadAttachment') || 'Download Attachment'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="#E8632B" />
            <AppHeader title={t('orderHistory')} />
            
            {isLoading ? (
                <ActivityIndicator size="large" color="#E8632B" style={{ marginTop: 50 }} />
            ) : isError ? (
                <Text style={styles.errorText}>{t('errorFetchingOrders')}</Text>
            ) : (
                <FlatList
                    data={data?.data || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('noOrders')}</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    listContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8632B', // Orange border per screenshot
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        color: '#E8632B',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    successBg: {
        backgroundColor: '#4CAF50', // Green
    },
    failBg: {
        backgroundColor: '#F44336', // Red
    },
    processingBg: {
        backgroundColor: '#FF9800', // Orange
    },
    statusText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 16,
        color: '#444',
        fontWeight: 'bold',
        flex: 1,
    },
    itemCount: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 10,
    },
    itemPrice: {
        fontSize: 16,
        color: '#E8632B',
        fontWeight: 'bold',
    },
    pmText: {
        fontSize: 13,
        color: '#888',
        marginTop: 5,
    },
    codeBox: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#E8632B',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#FDF7F4'
    },
    codeText: {
        fontSize: 14,
        color: '#333'
    },
    noteText: {
        color: '#DC3545',
        marginTop: 12,
        fontSize: 14
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#DC3545'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666'
    },
    adminNotesContainer: {
        marginTop: 16,
        backgroundColor: '#FDF7F4',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDE4D8',
    },
    adminNotesLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E8632B',
        marginBottom: 4,
    },
    adminNotesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    adminNotesText: {
        fontSize: 14,
        color: '#444',
        flex: 1,
    },
    copyBtn: {
        padding: 6,
        marginLeft: 10,
        backgroundColor: '#FFF',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FDE4D8',
    },
    downloadBtn: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8632B',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    downloadBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    }
});
