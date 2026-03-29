import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MobileHeaderProps {
    onMenuPress: () => void;
}

export function MobileHeader({ onMenuPress }: MobileHeaderProps) {
    return (
        <View style={styles.container}>
            <Pressable onPress={onMenuPress} style={styles.menuButton}>
                <Ionicons name="menu-outline" size={28} color="#1E293B" />
            </Pressable>
            <View style={styles.logoContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#FB5507" />
                <Text style={styles.logoText}>SAME IT</Text>
            </View>
            <View style={styles.placeholder} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    menuButton: {
        padding: 4,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    placeholder: {
        width: 36, // To balance the menu button
    },
});
