import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    Pressable, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/api/apiClient';

interface AppSettings {
    contactEmail: string;
    telegramLink: string;
    whatsappLink: string;
    aboutUs: string;
    intellectualProperty: string;
}

export default function SettingsScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [settings, setSettings] = useState<AppSettings>({
        contactEmail: '',
        telegramLink: '',
        whatsappLink: '',
        aboutUs: '',
        intellectualProperty: '',
    });
    const [activeTab, setActiveTab] = useState<'contact' | 'content'>('contact');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/settings');
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (e) {
            Toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await apiClient.put('/settings', settings);
            Toast.success('Settings updated!');
        } catch (e) {
            Toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#FB5507" /></View>;
    }

    return (
        <ScrollView style={[styles.container, !isDesktop && { padding: 16 }]}>
            <View style={[styles.header, !isDesktop && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                <View>
                    <Text style={[styles.title, !isDesktop && { fontSize: 22 }]}>App Settings</Text>
                    <Text style={styles.subtitle}>Manage contact information and app content.</Text>
                </View>
                <Pressable
                    onPress={handleSave}
                    style={[styles.saveBtn, saving && { opacity: 0.7 }, !isDesktop && { width: '100%', justifyContent: 'center' }]}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color="#FFF" size="small" /> : (
                        <>
                            <Ionicons name="save-outline" size={20} color="#FFF" />
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        </>
                    )}
                </Pressable>
            </View>

            <View style={[styles.tabs, !isDesktop && { width: '100%', overflow: 'hidden' }]}>
                <Pressable onPress={() => setActiveTab('contact')} style={[styles.tab, activeTab === 'contact' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>Contact Information</Text>
                </Pressable>
                <Pressable onPress={() => setActiveTab('content')} style={[styles.tab, activeTab === 'content' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>App Content</Text>
                </Pressable>
            </View>

            <View style={styles.row}>
                {activeTab === 'contact' ? (
                    <View style={styles.card}>
                        <Text style={styles.label}>Support Email</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.contactEmail}
                            onChangeText={(t) => setSettings({ ...settings, contactEmail: t })}
                            placeholder="support@example.com"
                        />

                        <Text style={styles.label}>Telegram Link</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.telegramLink}
                            onChangeText={(t) => setSettings({ ...settings, telegramLink: t })}
                            placeholder="https://t.me/yourusername"
                        />

                        <Text style={styles.label}>WhatsApp Link</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.whatsappLink}
                            onChangeText={(t) => setSettings({ ...settings, whatsappLink: t })}
                            placeholder="https://wa.me/123456789"
                        />
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.label}>About Us</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={settings.aboutUs}
                            onChangeText={(t) => setSettings({ ...settings, aboutUs: t })}
                            placeholder="Tell users about Same IT..."
                            multiline
                            numberOfLines={6}
                        />

                        <Text style={styles.label}>Intellectual Property</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={settings.intellectualProperty}
                            onChangeText={(t) => setSettings({ ...settings, intellectualProperty: t })}
                            placeholder="Disclaimer about diagrams and data..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    saveBtn: { backgroundColor: '#FB5507', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    tabs: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, alignSelf: 'flex-start' },
    tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    activeTab: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
    activeTabText: { color: '#1E293B' },
    row: { gap: 24, paddingBottom: 50 },
    card: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', flex: 1 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 15, color: '#1E293B' },
    textArea: { height: 120, textAlignVertical: 'top' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
