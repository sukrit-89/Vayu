import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductCard({ product, onPress }) {
    const handlePress = async () => {
        // Track click
        if (onPress) {
            onPress(product);
        }

        // Open product URL
        if (product.url) {
            await Linking.openURL(product.url);
        }
    };

    const getBudgetBadge = (budget) => {
        switch (budget) {
            case 'free':
                return { text: 'FREE', color: '#10b981' };
            case 'under-500':
                return { text: 'Under ₹500', color: '#3b82f6' };
            case 'under-1000':
                return { text: 'Under ₹1000', color: '#8b5cf6' };
            case 'under-5000':
                return { text: 'Under ₹5000', color: '#f97316' };
            case 'under-10000':
                return { text: 'Under ₹10000', color: '#ef4444' };
            default:
                return { text: 'Premium', color: '#6b7280' };
        }
    };

    const badge = getBudgetBadge(product.budget);

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            {product.image && (
                <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={2}>
                        {product.name}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badge.color }]}>
                        <Text style={styles.badgeText}>{badge.text}</Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {product.description}
                </Text>

                <View style={styles.footer}>
                    {product.price > 0 && (
                        <Text style={styles.price}>₹{product.price}</Text>
                    )}
                    <Ionicons name="open-outline" size={20} color="#3b82f6" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 8,
        marginVertical: 8,
        width: 280,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 12,
    },
    header: {
        marginBottom: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 12,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
});
