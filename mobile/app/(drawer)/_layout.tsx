import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useRootNavigationState } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';

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



            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollArea}>
                <SafeAreaView edges={['top']} style={styles.headerArea}>
                    <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
                    <Text style={styles.titleText}>{t('sameIt') || 'SAME IT'}</Text>
                </SafeAreaView>
                <View style={[styles.divider, { marginBlock: 10, marginHorizontal: 'auto', width: '100%', height: 2 }]} />
                {/* Links */}
                <View style={styles.linksContainer}>
                    <Pressable style={styles.linkItem} onPress={() => { toggleLanguage() }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="globe-outline"  size={18}  color="#FB5507"  />
                        </View>
                        <View style={styles.textAndDividerContainer}>
                            <Text style={styles.linkText}>{language === 'en' ? 'العربية' : 'English'}</Text>
                            <View style={styles.divider} />
                        </View>
                    </Pressable>

                    <Pressable style={styles.linkItem} onPress={() => { router.push('/drawer/contact') }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="call-outline" size={18} color="#FB5507" />
                        </View>
                        <View style={styles.textAndDividerContainer}>
                            <Text style={styles.linkText}>{t('contactUs')}</Text>
                            <View style={styles.divider} />
                        </View>
                    </Pressable>

                    <Pressable style={styles.linkItem} onPress={() => { router.push('/drawer/intellectual') }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="shield-checkmark-outline" size={18} color="#FB5507" />
                        </View>
                        <View style={styles.textAndDividerContainer}>
                            <Text style={styles.linkText}>{t('intellectualProperty')}</Text>
                            <View style={styles.divider} />
                        </View>
                    </Pressable>

                    <Pressable style={styles.linkItem} onPress={() => { router.push('/drawer/about') }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="information-circle-outline" size={18} style={{color: "#FB5507", borderColor: "#FB5507"}} color="#FB5507" />
                        </View>
                        <View style={styles.textAndDividerContainer}>
                            <Text style={styles.linkText}>{t('about')}</Text>
                            <View style={styles.divider} />
                        </View>
                    </Pressable>

                    {/* Additional Logout Link */}
                    <Pressable style={styles.linkItem} onPress={handleLogout}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="log-out-outline" size={18} color="#FB5507" />
                        </View>
                        <View style={styles.textAndDividerContainer}>
                            <Text style={[styles.linkText, { color: '#FFEBE0' }]}>{t('logout')}</Text>
                            <View style={[styles.divider, { backgroundColor: 'transparent' }]} />
                        </View>
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
    const navigationState = useRootNavigationState();

    // Global auth guard — redirect to login when token is cleared (e.g., subscription expired)
    useEffect(() => {
        if (!navigationState?.key) return;

        const timer = setTimeout(() => {
            if (!token) {
                router.replace('/auth/login');
            }
        }, 1);

        return () => clearTimeout(timer);
    }, [token, navigationState?.key]);

    return (
        <Drawer

            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '85%',
                    backgroundColor: '#FB5507',
                    // borderTopEndRadius: 40,
                    // borderBottomEndRadius: 40,
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
        backgroundColor: '#FB5507',
        // borderTopEndRadius: 40,
        // borderBottomEndRadius: 40,
    },
    headerArea: {
        marginTop: 60,
        alignItems: 'center',
        // marginBottom: 40,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '300',
        color: '#FFF',
        letterSpacing: 2,
    },
    scrollArea: {
        paddingHorizontal: 30,
    },
    linksContainer: {
        // marginTop: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 1,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        marginTop: 10,
    },
    iconContainer: {
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#FFF',
        color: "#FB5507",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textAndDividerContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    linkText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'left',
        marginBottom: 8, // Space between text and divider
        // marginTop: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#FFF',
        width: '80%',
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
