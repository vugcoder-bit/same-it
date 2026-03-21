import { useRouter } from 'expo-router';

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/hooks/use-locale';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 40,
    },
    brandText: {
        fontSize: 34,
        fontWeight: '300',
        letterSpacing: 3,
        textAlign: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    poweredByContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    poweredByText: {
        fontSize: 16,
        marginBottom: 8,
    },
    creditText: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 4,
    },
});

import { useAuthStore } from '@/store/authStore';

export default function SplashRoute() {
    const router = useRouter();
    const { t } = useLocale();
    const token = useAuthStore(state => state.token);

    useEffect(() => {
        const hideSplash = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (token) {
                router.replace('/(drawer)/(tabs)');
            } else {
                router.replace('/auth/login');
            }
        };

        hideSplash();
    }, [router, token]);

    return (
        <View
            className='flex-1 items-center justify-center'
            style={[
                styles.container,
                { backgroundColor: '#E8632B' },
            ]}
        >
            <Text style={[styles.brandText, { color: '#FFFFFF' }]}>{t('sameIt') || 'SAME IT'}</Text>

            <View style={styles.poweredByContainer}>
                <Text style={[styles.poweredByText, { color: '#FFFFFF' }]}>{t('poweredBy')}</Text>
                <Text style={[styles.creditText, { backgroundColor: '#FFD700', color: '#000000' }]}>CableLaty</Text>
            </View>
        </View>
    );
}
