import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function ContactScreen() {
    const { t } = useLocale();
    const [settings, setSettings] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        apiClient.get('/settings')
            .then(res => setSettings(res.data.data))
            .catch(() => { });
    }, []);

    const sendMessage = async () => {
        if (!name || !email || !message) {
            Alert.alert(t('error'), t('pleaseFillRequiredFields'));
            return;
        }
        try {
            setSending(true);
            await apiClient.post('/contact', { name, email, message });
            Alert.alert(t('success'), t('messageSent'));
            setName('');
            setEmail('');
            setMessage('');
        } catch (e) {
            Alert.alert(t('error'), t('failedToSendMessage'));
        } finally {
            setSending(false);
        }
    };

    const openLink = (url: string) => {
        if (url) Linking.openURL(url).catch(() => Alert.alert(t('error'), 'Could not open link'));
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="#FB5507" />
            <AppHeader title={t('contactUs')} />
            <ScrollView contentContainerStyle={styles.scroll}>

                <Text style={styles.sectionTitle}>{t('sendUsAMessage')}</Text>
                <TextInput style={styles.input} placeholder={t('name')} value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" />
                <TextInput style={[styles.input, styles.textArea]} placeholder={t('message')} value={message} onChangeText={setMessage} multiline numberOfLines={5} />

                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
                    {sending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendText}>{t('sendMessage')}</Text>}
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>{t('quickContact')}</Text>
                <View style={styles.socialRow}>
                    {settings?.contactEmail && (
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#EA4335' }]} onPress={() => openLink(`mailto:${settings.contactEmail}`)}>
                            <Ionicons name="mail" size={24} color="#FFF" />
                        </TouchableOpacity>
                    )}
                    {settings?.telegramLink && (
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#0088cc' }]} onPress={() => openLink(settings.telegramLink)}>
                            <Ionicons name="paper-plane" size={24} color="#FFF" />
                        </TouchableOpacity>
                    )}
                    {settings?.whatsappLink && (
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#25D366' }]} onPress={() => openLink(settings.whatsappLink)}>
                            <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    scroll: { padding: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 },
    textArea: { height: 120, textAlignVertical: 'top' },
    sendBtn: { backgroundColor: '#FB5507', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    sendText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 32 },
    socialRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
    socialBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});
