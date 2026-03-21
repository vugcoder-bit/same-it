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
    const [mode, setMode] = useState<'toHex' | 'toText'>('toHex');

    const handleConvert = async () => {
        if (!inputCode.trim()) {
            Toast.warn(t('pleaseEnterCode'));
            return;
        }
        try {
            setLoading(true);
            const { data } = await apiClient.post('/convert', { text: inputCode, mode });
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
            <AppHeader title={t('convertArabic') || 'Convert Arabic Code'} />
            
            <View style={styles.content}>
                {/* Mode Toggle */}
                <View style={styles.modeRow}>
                    <Pressable
                        style={[styles.modeBtn, mode === 'toHex' && styles.modeBtnActive]}
                        onPress={() => { setMode('toHex'); setResult(''); }}
                    >
                        <Text style={[styles.modeBtnText, mode === 'toHex' && styles.modeBtnTextActive]}>
                            {t('textToHex') || 'Text → Hex'}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.modeBtn, mode === 'toText' && styles.modeBtnActive]}
                        onPress={() => { setMode('toText'); setResult(''); }}
                    >
                        <Text style={[styles.modeBtnText, mode === 'toText' && styles.modeBtnTextActive]}>
                            {t('hexToText') || 'Hex → Text'}
                        </Text>
                    </Pressable>
                </View>

                {/* Input */}
                <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>
                        {mode === 'toHex' 
                            ? (t('enterArabicText') || 'Enter Arabic Text') 
                            : (t('enterHexCode') || 'Enter Hex Code')}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder={mode === 'toHex' 
                            ? (t('arabicCodePlaceholder') || 'أدخل النص العربي هنا') 
                            : 'D8 A3 D8 AF D8 AE D9 84'}
                        placeholderTextColor="#A0A0A0"
                        value={inputCode}
                        onChangeText={setInputCode}
                        textAlign={mode === 'toHex' ? 'right' : 'left'}
                        multiline
                    />
                </View>

                {/* Convert Button */}
                <Pressable style={styles.convertButton} onPress={handleConvert} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('convert')}</Text>}
                </Pressable>

                <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>❗</Text>
                    <Text style={styles.warningText}>
                        {t('convertArabicWarning')}
                    </Text>
                </View>

                {/* Result */}
                {result !== '' && (
                    <View style={styles.formGroup}>
                        <Text style={styles.resultLabel}>{t('results')}</Text>
                        <View style={styles.resultBox}>
                            <Text style={styles.resultText} selectable>{result}</Text>
                            <Pressable onPress={copyResult} style={styles.copyBtn}>
                                <Ionicons name="copy-outline" size={20} color="#E8632B" />
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Reference / Examples */}
                <View style={styles.examplesContainer}>
                    <Text style={styles.examplesTitle}>{t('commonExamples') || 'Common Examples'}:</Text>
                    <View style={styles.exampleRow}>
                        <Text style={styles.exampleText}>أ  →  D8 A3</Text>
                        <View style={styles.exampleDivider} />
                        <Text style={styles.exampleText}>ب  →  D8 A8</Text>
                        <View style={styles.exampleDivider} />
                        <Text style={styles.exampleText}>ت  →  D8 AA</Text>
                    </View>
                </View>

                <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>❗</Text>
                    <Text style={styles.warningText}>
                        {t('convertArabicWarning')}
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
        padding: 20,
    },
    modeRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    modeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modeBtnActive: {
        backgroundColor: '#E8632B',
        elevation: 2,
    },
    modeBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
    },
    modeBtnTextActive: {
        color: '#FFF',
    },
    formGroup: {
        width: '100%',
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        minHeight: 60,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: '#E8632B',
        borderRadius: 12,
        fontSize: 18,
        color: '#333',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    resultLabel: {
        fontSize: 16,
        color: '#6A994E',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    resultBox: {
        width: '100%',
        minHeight: 80,
        borderWidth: 1,
        borderColor: '#E8632B',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFAF7',
    },
    resultText: {
        flex: 1,
        fontSize: 18,
        color: '#1E293B',
        fontFamily: 'monospace',
    },
    copyBtn: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDE4D8',
    },
    convertButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#E8632B',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        elevation: 2,
        marginBottom: 24,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    warningContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 24,
        alignItems: 'flex-start',
        paddingBottom: 20,
    },
    examplesContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
        marginVertical: 10,
    },
    examplesTitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: 'bold',
        marginBottom: 6,
    },
    exampleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
    },
    exampleText: {
        fontSize: 13,
        color: '#475569',
        fontFamily: 'monospace',
    },
    exampleDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#CBD5E1',
    },
    warningIcon: {
        fontSize: 16,
        marginTop: 2,
        marginRight: 8,
        color: '#E8632B',
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#A0A0A0',
        textAlign: 'right',
        lineHeight: 22,
    },
});
