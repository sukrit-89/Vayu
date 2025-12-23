import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
    const [message, setMessage] = useState('Welcome to Air Quality App! 🌬️');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Text style={styles.title}>Air Quality Monitor</Text>
                <Text style={styles.subtitle}>India AQI Tracker</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.message}>{message}</Text>
            </View>

            <View style={styles.features}>
                <Text style={styles.featuresTitle}>Features:</Text>
                <Text style={styles.feature}>✅ Real-time AQI Data</Text>
                <Text style={styles.feature}>✅ AI Health Chatbot</Text>
                <Text style={styles.feature}>✅ Voice Support</Text>
                <Text style={styles.feature}>✅ Community Actions</Text>
                <Text style={styles.feature}>✅ News & Recommendations</Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setMessage('App is ready! Backend configuration needed to enable all features.')}>
                <Text style={styles.buttonText}>Test Button</Text>
            </TouchableOpacity>

            <Text style={styles.note}>
                Note: Configure backend API to enable all features
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f0f9ff',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0369a1',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#0284c7',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        color: '#374151',
        lineHeight: 28,
    },
    features: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0369a1',
        marginBottom: 16,
    },
    feature: {
        fontSize: 16,
        color: '#4b5563',
        marginBottom: 12,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#0284c7',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    note: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
