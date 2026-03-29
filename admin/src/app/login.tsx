import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/apiClient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }
        try {
            setLoading(true);
            setError('');
            console.log('Attempting login for:', username, 'at', apiClient.defaults.baseURL);
            const response = await apiClient.post('/auth/login', { username, password });

            console.log('Login response:', response.data);

            // Backend returns { success, data: { token, user, role } }
            if (!response.data?.data) {
                const msg = 'Invalid server response format.';
                setError(msg);
                Toast.error(msg);
                return;
            }

            const { token, user, role } = response.data.data;

            if (role !== 'ADMIN') {
                const msg = 'Access denied. Admin only.';
                setError(msg);
                Toast.warn(msg);
                return;
            }

            setAuth(token, { ...user, role });
            console.log('Login successful, navigating...');
            Toast.success('Login successful!');
            router.replace('/');
        } catch (e: any) {
            console.error('Login error detail:', e);
            let msg = '';
            if (e.code === 'ERR_NETWORK') {
                msg = `Network Error: Cannot reach server at ${apiClient.defaults.baseURL}`;
            } else {
                msg = e.response?.data?.message || 'Login failed. Please check credentials.';
            }
            setError(msg);
            Toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={styles.content}>
                <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome Back,</Text>
                    <Text style={styles.adminText}>Admin Panel</Text>
                    <View style={styles.underline} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.form}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter username"
                            placeholderTextColor="#A0A0A0"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            placeholderTextColor="#A0A0A0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.loginButton,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </Pressable>
                </Animated.View>

                <Animated.Text
                    entering={FadeInDown.delay(400).duration(1000)}
                    style={styles.footerText}
                >
                    Secured by Same-It Backend
                </Animated.Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 50,
    },
    welcomeText: {
        fontSize: 28,
        color: '#1E293B',
        fontWeight: '300',
    },
    adminText: {
        fontSize: 36,
        color: '#FB5507',
        fontWeight: 'bold',
        marginTop: 5,
    },
    underline: {
        height: 4,
        width: 60,
        backgroundColor: '#FB5507',
        marginTop: 10,
        borderRadius: 2,
    },
    form: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 50,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1E293B',
        backgroundColor: '#F8FAFC',
    },
    loginButton: {
        backgroundColor: '#FB5507',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#FB5507',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
        backgroundColor: '#94A3B8',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FB5507',
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '500',
    },
    footerText: {
        marginTop: 40,
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 14,
    },
});
