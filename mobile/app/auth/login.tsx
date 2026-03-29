import { Button } from '@/components/ui/button';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import React from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, TextInput, ActivityIndicator } from 'react-native';
import { Toast } from 'toastify-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLogin } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/use-locale';
import { apiClient } from '@/api/apiClient';
import '../../global.css';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    topBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: '#FB5507',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 0,
    },
    bottomBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        backgroundColor: '#F5F5F5',
        zIndex: -1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 30,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#FB5507',
    },
    activeTabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FB5507',
    },
    inactiveTabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999999',
    },
    formArea: {
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#FAFAFA',
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        height: 50,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
    },
    eyeIconContainer: {
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeIconText: {
        fontSize: 16,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    button: {
        backgroundColor: '#FB5507',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#FB5507',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noAccountSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    noAccountText: {
        fontSize: 15,
        color: '#666',
        marginBottom: 20,
    },
    contactHint: {
        fontSize: 13,
        color: '#999',
        marginBottom: 16,
        textAlign: 'center',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
    },
    socialIcon: {
        width: 36,
        height: 36,
    },
});

import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useLocale();
    const loginMutation = useLogin();
    const { token, _hasHydrated } = useAuthStore();
    const [showPassword, setShowPassword] = React.useState(false);
    const [settings, setSettings] = React.useState<any>(null);

    React.useEffect(() => {
        if (_hasHydrated && token) {
            router.replace('/(drawer)/(tabs)');
        }
    }, [_hasHydrated, token]);

    React.useEffect(() => {
        apiClient.get('/settings')
            .then(res => setSettings(res.data.data))
            .catch(() => { });
    }, []);

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .min(4, t('usernameMinLength') || 'Username must be at least 4 characters')
            .required(t('usernameRequired') || 'Username is required'),
        password: Yup.string()
            .min(6, t('passwordMinLength') || 'Password must be at least 6 characters')
            .required(t('passwordRequired') || 'Password is required')
    });

    const openLink = (url: string) => {
        if (url) Linking.openURL(url).catch(() => { });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Split Background Layer */}
            <View style={styles.topBackground} />
            <View style={styles.bottomBackground} />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]} showsVerticalScrollIndicator={false}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>{t('sameIt') || 'SAME IT'}</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <View style={styles.tabContainer}>
                        <View style={[styles.tab, styles.activeTab]}>
                            <Text style={styles.activeTabText}>{t('login')}</Text>
                        </View>
                    </View>

                    <Formik
                        initialValues={{ username: '', password: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(true);
                            loginMutation.mutate(values, {
                                onSuccess: () => {
                                    Toast.success(t('loginSuccess') || 'Logged in successfully');
                                    router.replace('/(drawer)/(tabs)');
                                    setSubmitting(false);
                                },
                                onError: (error: any) => {
                                    const errorMessage = error?.response?.data?.message || t('loginFailed') || 'Failed to login. Please try again.';
                                    Toast.error(errorMessage);
                                    setSubmitting(false);
                                }
                            });
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                            <View style={styles.formArea}>
                                <Text style={styles.label}>{t('username') || 'Username'}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('username') || 'Username'}
                                    onChangeText={handleChange('username')}
                                    onBlur={handleBlur('username')}
                                    value={values.username}
                                    autoCapitalize="none"
                                />
                                {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                                <Text style={styles.label}>{t('password') || 'Password'}</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder={t('password') || 'Password'}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                        secureTextEntry={!showPassword}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                                        <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                    </Pressable>
                                </View>
                                {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                                <Pressable
                                    style={styles.button}
                                    onPress={() => handleSubmit()}
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>{t('login')}</Text>
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </Formik>
                </View>

                {/* Don't have an account section */}
                <View style={styles.noAccountSection}>
                    <Text style={styles.noAccountText}>{t('noAccount')}</Text>
                    {/* <Text style={styles.contactHint}>{t('contactAdminToRegister')}</Text> */}
                    <View style={styles.socialRow}>
                        {settings?.telegramLink && (
                            <Pressable onPress={() => openLink(settings.telegramLink)}>
                                <Image source={require('../../assets/images/telegram.png')} style={styles.socialIcon} resizeMode="contain" width={32} height={35} />
                            </Pressable>
                        )}
                        {settings?.whatsappLink && (
                            <Pressable onPress={() => openLink(settings.whatsappLink)}>
                                <Image source={require('../../assets/images/whatsapp.png')} style={styles.socialIcon} resizeMode="contain" width={35} height={35} />
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}