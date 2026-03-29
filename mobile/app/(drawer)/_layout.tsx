import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';

function CustomDrawerContent(props: any) {
    const { t, language, toggleLanguage } = useLocale();
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace('/auth/login');
    };
    return (
        <View style={styles.container}>
            {/* Drawer Header */}
            <SafeAreaView edges={['top']} style={styles.headerArea}>
                <Text style={styles.titleText}>{t('sameIt') || 'SAME IT'}</Text>
            </SafeAreaView>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollArea}>

                {/* Links */}
                <View style={styles.linksContainer}>
                    <Pressable style={styles.linkItem} onPress={() => { toggleLanguage() }}>
                        <Text style={styles.linkText}>{language === 'en' ? 'العربية' : 'English'}</Text>
                    </Pressable>
                    <View style={styles.divider} />

                    <Pressable style={styles.linkItem} onPress={() => { router.push('/drawer/contact') }}>
                        <Text style={styles.linkText}>{t('contactUs')}</Text>
                    </Pressable>
                    <View style={styles.divider} />

                    <Pressable style={styles.linkItem} onPress={() => { router.push('/drawer/intellectual') }}>
                        <Text style={styles.linkText}>{t('intellectualProperty')}</Text>
                    </Pressable>
                    <View style={styles.divider} />

                    <Pressable style={styles.linkItem} onPress={() => { router.push('/drawer/about') }}>
                        <Text style={styles.linkText}>{t('about')}</Text>
                    </Pressable>
                    <View style={styles.divider} />

                    {/* Additional Logout Link for functionality */}
                    <Pressable style={styles.linkItem} onPress={handleLogout}>
                        <Text style={[styles.linkText, { color: '#FFEBE0' }]}>{t('logout')}</Text>
                    </Pressable>
                </View>

            </DrawerContentScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>{t('version')} 4.0v</Text>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
    const { t } = useLocale();
    const token = useAuthStore((state) => state.token);
    const router = useRouter();

    // Global auth guard — redirect to login when token is cleared (e.g., subscription expired)
    useEffect(() => {
        if (!token) {
            router.replace('/auth/login');
        }
    }, [token]);

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '75%',
                    backgroundColor: '#E8632B',
                    borderTopEndRadius: 40,
                    borderBottomEndRadius: 40,
                },
            }}
        >
            <Drawer.Screen name="(tabs)" options={{ drawerLabel: t('home') }} />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8632B',
        borderTopEndRadius: 40,
        borderBottomEndRadius: 40,
    },
    headerArea: {
        marginTop: 60,
        alignItems: 'center',
        marginBottom: 40,
    },
    titleText: {
        fontSize: 32,
        fontWeight: '300',
        color: '#FFF',
        letterSpacing: 2,
    },
    scrollArea: {
        paddingHorizontal: 30,
    },
    linksContainer: {
        marginTop: 20,
    },
    linkItem: {
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 20,
        color: '#FFF',
        textAlign: 'left',
    },
    divider: {
        height: 1,
        backgroundColor: '#FFF',
        opacity: 0.6,
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#FFF',
        textAlign: 'center',
    },
});
