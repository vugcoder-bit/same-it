import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

const { width } = Dimensions.get('window');
// Padding on sides is 16*2 = 32. So card width is width - 32
const CARD_WIDTH = width - 32;

const fetchAds = async () => {
    const { data } = await apiClient.get('/advertisements');
    return data; // { success: true, data: [...] }
};

export function AdvertisementCarousel() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['advertisements'],
        queryFn: fetchAds,
    });

    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const ads = data?.data || [];

    useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % ads.length;
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        }, 3000); // Swipe every 3 seconds

        return () => clearInterval(interval);
    }, [currentIndex, ads.length]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / CARD_WIDTH);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < ads.length) {
            setCurrentIndex(newIndex);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FB5507" />
            </View>
        );
    }

    if (isError) {
        return null; // Return nothing if there are no ads or error.
    }
    if (ads.length === 0) {
        return <View style={[styles.loadingContainer, { height: 100, backgroundColor: 'transparent', shadowColor: 'transparent', elevation: 0, shadowOpacity: 0, shadowRadius: 0 }]}></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={ads}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image
                            source={item.imageUrl}
                            style={styles.image}
                            contentFit="cover"
                        />
                    </View>
                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    slide: {
        width: CARD_WIDTH,
        height: 120, // Match the original Announcement Card height
        borderRadius: 16,
        overflow: 'hidden',
        // Optional spacing if wanted, but padding is handled by the parent scroll content
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#FB5507',
        width: 12, // makes the active dot a bit wider/larger
    },
    inactiveDot: {
        backgroundColor: '#D3D3D3',
    }
});
