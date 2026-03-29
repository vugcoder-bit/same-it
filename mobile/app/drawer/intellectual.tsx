import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { StatusBar } from 'expo-status-bar';

export default function IntellectualScreen() {
    const { t } = useLocale();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/settings')
            .then(res => setContent(res.data.data.intellectualProperty))
            .catch(() => setContent(''))
            .finally(() => setLoading(false));
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="#FB5507" />
            <AppHeader title={t('intellectualProperty')} />
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.text}>{content}</Text>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 24 },
    text: { fontSize: 16, color: '#475569', lineHeight: 28 },
});
