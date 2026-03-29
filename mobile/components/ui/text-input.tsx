import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View, Text } from 'react-native';

interface TextInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onBlur?: (e: any) => void;
    secureTextEntry?: boolean;
    editable?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    error?: string | false;
    touched?: boolean;
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#FB5507',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }
});

export function TextInput({
    placeholder,
    value,
    onChangeText,
    onBlur,
    secureTextEntry = false,
    editable = true,
    keyboardType = 'default',
    error,
    touched,
}: TextInputProps) {
    return (
        <View style={styles.inputContainer}>
            <RNTextInput
                style={[styles.input, touched && error ? styles.inputError : null]}
                placeholder={placeholder}
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                secureTextEntry={secureTextEntry}
                editable={editable}
                keyboardType={keyboardType}
            />
            {touched && error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}
