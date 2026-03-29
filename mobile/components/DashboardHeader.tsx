import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useRouter, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';


export function DashboardHeader({ title = 'SAME IT' }: { title?: string }) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Image
                    source={require('../assets/svg/menu.svg')}
                    style={styles.icon}
                    contentFit="contain"
                />
            </Pressable>

            <Text style={styles.title}>{title}</Text>

            <Pressable onPress={() => router.push('/order-history')}>
                <Image
                    source={require('../assets/svg/history.svg')}
                    style={styles.icon}
                    contentFit="contain"
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FB5507',
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 10,
    },
    icon: {
        width: 28,
        height: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: '400',
        color: '#FFF',
        letterSpacing: 1,
    },
});
