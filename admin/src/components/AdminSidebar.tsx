import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');
const IS_DESKTOP = width > 768;

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const router = useRouter();
    const segments = useSegments();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const menuItems = [
        { name: 'Dashboard', icon: 'grid-outline', route: '/' },
        { name: 'Users', icon: 'people-outline', route: '/admin/users' },
        { name: 'Devices', icon: 'phone-portrait-outline', route: '/admin/devices' },
        { name: 'Sub-Categories', icon: 'grid-outline', route: '/admin/sub-categories' },
        { name: 'Compatibility', icon: 'layers-outline', route: '/admin/compatibility' },
        { name: 'Advertisements', icon: 'megaphone-outline', route: '/admin/advertisements' },
        { name: 'Errors', icon: 'alert-circle-outline', route: '/admin/errors' },
        { name: 'Schematics', icon: 'map-outline', route: '/admin/schematics' },
        { name: 'Services', icon: 'construct-outline', route: '/admin/services' },
        { name: 'Payment Methods', icon: 'card-outline', route: '/admin/payment-methods' },
        { name: 'Orders', icon: 'cart-outline', route: '/admin/orders' },
        { name: 'App Settings', icon: 'settings-outline', route: '/admin/settings' },
        { name: 'Contact Messages', icon: 'mail-outline', route: '/admin/messages' },
    ];

    const isActive = (route: string) => {
        const path = segments.join('/');
        if (route === '/' && path === 'admin') return true;
        const targetPath = route === '/' ? 'admin' : `admin/${route.replace('/admin/', '')}`;
        return path === targetPath;
    };

    const handleNavigate = (route: string) => {
        router.push(route as any);
        if (onClose) onClose();
    };

    if (!IS_DESKTOP && !isOpen) return null;

    return (
        <View style={[
            styles.container,
            !IS_DESKTOP && styles.mobileDrawer
        ]}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Ionicons name="shield-checkmark" size={32} color="#E8632B" />
                </View>
                {(IS_DESKTOP || isOpen) && (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.logoText}>SAME IT</Text>
                        <Text style={styles.logoSubtext}>Admin Panel</Text>
                    </View>
                )}
                {!IS_DESKTOP && (
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-outline" size={28} color="#64748B" />
                    </Pressable>
                )}
            </View>

            <ScrollView style={styles.scroll}>
                <View style={styles.section}>
                    {(IS_DESKTOP || isOpen) && <Text style={styles.sectionTitle}>Main Menu</Text>}
                    {menuItems.map((item) => (
                        <Pressable
                            key={item.route}
                            onPress={() => handleNavigate(item.route)}
                            style={[
                                styles.menuItem,
                                isActive(item.route) && styles.activeMenuItem
                            ]}
                        >
                            <Ionicons 
                                name={item.icon as any} 
                                size={22} 
                                color={isActive(item.route) ? '#E8632B' : '#64748B'} 
                            />
                            {(IS_DESKTOP || isOpen) && (
                                <Text style={[
                                    styles.menuItemText,
                                    isActive(item.route) && styles.activeMenuItemText
                                ]}>
                                    {item.name}
                                </Text>
                            )}
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {(IS_DESKTOP || isOpen) && (
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.userMeta}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.username}</Text>
                            <Text style={styles.userRole}>Administrator</Text>
                        </View>
                    </View>
                )}
                <Pressable onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    {(IS_DESKTOP || isOpen) && <Text style={styles.logoutText}>Logout</Text>}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: IS_DESKTOP ? 280 : 80,
        backgroundColor: '#FFF',
        borderRightWidth: 1,
        borderRightColor: '#E2E8F0',
        height: '100%',
    },
    mobileDrawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    closeButton: {
        padding: 4,
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FDF2F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    logoSubtext: {
        fontSize: 12,
        color: '#64748B',
    },
    scroll: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 4,
        gap: 12,
    },
    activeMenuItem: {
        backgroundColor: '#FDF2F0',
    },
    menuItemText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '500',
    },
    activeMenuItemText: {
        color: '#E8632B',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    userMeta: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    userRole: {
        fontSize: 12,
        color: '#64748B',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 8,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
});
