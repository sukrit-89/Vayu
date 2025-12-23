import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AQICard({ aqi, city, state }) {
    // Determine color scheme and label based on AQI value
    const getAQIInfo = (value) => {
        if (value <= 50) {
            return {
                colors: ['#10b981', '#34d399'],
                label: 'Good',
                emoji: '😊',
                textColor: '#ffffff'
            };
        } else if (value <= 100) {
            return {
                colors: ['#fbbf24', '#fcd34d'],
                label: 'Moderate',
                emoji: '😐',
                textColor: '#ffffff'
            };
        } else if (value <= 200) {
            return {
                colors: ['#f97316', '#fb923c'],
                label: 'Unhealthy',
                emoji: '😷',
                textColor: '#ffffff'
            };
        } else if (value <= 300) {
            return {
                colors: ['#ef4444', '#f87171'],
                label: 'Very Unhealthy',
                emoji: '😨',
                textColor: '#ffffff'
            };
        } else {
            return {
                colors: ['#8b5cf6', '#a78bfa'],
                label: 'Hazardous',
                emoji: '☠️',
                textColor: '#ffffff'
            };
        }
    };

    const aqiInfo = getAQIInfo(aqi);

    return (
        <LinearGradient
            colors={aqiInfo.colors}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Text style={[styles.location, { color: aqiInfo.textColor }]}>
                📍 {city}{state ? `, ${state}` : ''}
            </Text>
            <Text style={[styles.aqiValue, { color: aqiInfo.textColor }]}>
                {aqi}
            </Text>
            <View style={styles.labelContainer}>
                <Text style={styles.emoji}>{aqiInfo.emoji}</Text>
                <Text style={[styles.label, { color: aqiInfo.textColor }]}>
                    {aqiInfo.label}
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 32,
        marginHorizontal: 20,
        marginVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    location: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    aqiValue: {
        fontSize: 72,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    emoji: {
        fontSize: 24,
        marginRight: 8,
    },
    label: {
        fontSize: 20,
        fontWeight: '600',
    },
});
