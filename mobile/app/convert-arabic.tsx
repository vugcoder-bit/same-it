import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { apiClient } from '@/api/apiClient';
import { useLocale } from '@/hooks/use-locale';
import { Toast } from 'toastify-react-native';
import { AppHeader } from '@/components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

export default function ConvertArabicScreen() {
    const { t } = useLocale();
    const [inputCode, setInputCode] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConvert = async () => {
        if (!inputCode.trim()) {
            Toast.warn(t('pleaseEnterCode'));
            return;
        }
        try {
            setLoading(true);
            const { data } = await apiClient.post('/convert', { text: inputCode, mode: 'toHex' });
            setResult(data.data?.converted || '');
            Toast.success(t('convertedSuccessfully'));
        } catch (e: any) {
            setResult('');
            Toast.error(e.response?.data?.message || t('conversionFailed'));
        } finally {
            setLoading(false);
        }
    };

    const copyResult = async () => {
        if (result) {
            await Clipboard.setStringAsync(result);
            Toast.success(t('copied') || 'Copied!');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="#E8632B" />
            <AppHeader title={t('convertArabic') || 'Convert Arabic Password'} />
            
            <View style={styles.content}>
                {/* Input */}
                <View style={styles.formGroup}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.floatingLabel}>
                            {t('enterArabicText') || 'الرمز بالعربي'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('arabicCodePlaceholder') || 'مرحبا'}
                            placeholderTextColor="#A0A0A0"
                            value={inputCode}
                            onChangeText={setInputCode}
                            textAlign="center"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Result */}
                <View style={[styles.formGroup, { marginTop: 10 }]}>
                    <Text style={styles.resultLabel}>{t('results') || 'النتائج'}</Text>
                    <View style={styles.resultBox}>
                        <Text style={[styles.resultText, !result && { color: '#A0A0A0' }]} selectable>
                            {result || '---'}
                        </Text>
                        {result !== '' && (
                            <Pressable onPress={copyResult} style={styles.copyBtn}>
                                <Ionicons name="copy-outline" size={20} color="#E8632B" />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Convert Button */}
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <Pressable style={styles.convertButton} onPress={handleConvert} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('convert') || 'تحويل'}</Text>}
                    </Pressable>
                </View>

                {/* Warning */}
                <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>❗</Text>
                    <Text style={styles.warningText}>
                        {t('convertArabicWarning') || 'هذه الميزة تستخدم عندما يكون الهاتف مقفل برمز عربي و لا يمكن تغيير الكيبورد الى اللغة العربية'}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 40,
    },
    formGroup: {
        width: '100%',
        marginBottom: 20,
    },
    inputContainer: {
        position: 'relative',
        width: '100%',
    },
    floatingLabel: {
        position: 'absolute',
        top: -10,
        alignSelf: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        fontSize: 12,
        color: '#E8632B',
        fontWeight: 'bold',
        zIndex: 1,
    },
    input: {
        width: '100%',
        height: 60,
        borderWidth: 1.5,
        borderColor: '#E8632B',
        borderRadius: 12,
        fontSize: 18,
        color: '#333',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
    },
    resultLabel: {
        fontSize: 14,
        color: '#6A994E',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    resultBox: {
        width: '100%',
        height: 60,
        borderWidth: 1,
        borderColor: '#E8632B',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    resultText: {
        flex: 1,
        fontSize: 18,
        color: '#1E293B',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    copyBtn: {
        padding: 6,
        position: 'absolute',
        right: 10,
    },
    convertButton: {
        width: '60%',
        height: 50,
        backgroundColor: '#E8632B',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        elevation: 2,
        marginBottom: 40,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    warningContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
    },
    warningIcon: {
        fontSize: 16,
        marginTop: 2,
        marginRight: 6,
        color: '#E8632B',
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 22,
    },
});
