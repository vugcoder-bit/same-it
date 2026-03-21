import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
    onPress?: () => void;
    label: string;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
}

const styles = StyleSheet.create({
    buttonWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        minWidth: 120,
    },
    primaryButton: {
        backgroundColor: '#E8632B',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#E8632B',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFF',
    },
    secondaryText: {
        color: '#E8632B',
    },
    pressedPrimary: {
        backgroundColor: '#D4521F',
    },
    pressedSecondary: {
        opacity: 0.8,
    },
});

export function Button({
    onPress,
    label,
    disabled = false,
    variant = 'primary',
}: ButtonProps) {
    const isPrimary = variant === 'primary';

    return (
        <View style={styles.buttonWrapper}>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
                style={[
                    styles.button,
                    isPrimary ? styles.primaryButton : styles.secondaryButton,
                ]}
            >
                <Text style={[styles.buttonText, isPrimary ? styles.primaryText : styles.secondaryText]}>
                    {label}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
