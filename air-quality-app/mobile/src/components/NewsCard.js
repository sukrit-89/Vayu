import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NewsCard({ news }) {
    const handlePress = async () => {
        if (news.source_url) {
            await Linking.openURL(news.source_url);
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            {news.image_url && (
                <Image
                    source={{ uri: news.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {news.title}
                </Text>

                <Text style={styles.summary} numberOfLines={4}>
                    {news.summary}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.source}>{news.source_name}</Text>
                    <Ionicons name="open-outline" size={16} color="#3b82f6" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        lineHeight: 22,
    },
    summary: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    source: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
});
