import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActionCard({ action, onComplete, isCompleted }) {
    const getActionIcon = (type) => {
        switch (type) {
            case 'petition':
                return 'document-text';
            case 'retweet':
                return 'share-social';
            case 'report':
                return 'alert-circle';
            case 'donation':
                return 'card';
            case 'volunteer':
                return 'hand-left';
            default:
                return 'megaphone';
        }
    };

    const handlePress = async () => {
        // Open the action URL
        if (action.action_url) {
            await Linking.openURL(action.action_url);
        }

        // Mark as completed
        if (onComplete && !isCompleted) {
            onComplete(action.id);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name={getActionIcon(action.action_type)} size={24} color="#3b82f6" />
                <Text style={styles.title}>{action.title}</Text>
            </View>

            <Text style={styles.description}>{action.description}</Text>

            <View style={styles.footer}>
                <Text style={styles.counter}>
                    🎯 {action.completed_count} people completed
                </Text>

                <TouchableOpacity
                    style={[
                        styles.button,
                        isCompleted && styles.completedButton
                    ]}
                    onPress={handlePress}
                    disabled={isCompleted}
                >
                    <Text style={[
                        styles.buttonText,
                        isCompleted && styles.completedButtonText
                    ]}>
                        {isCompleted ? '✓ Completed' : 'Take Action'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
        color: '#1f2937',
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    counter: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    completedButton: {
        backgroundColor: '#10b981',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    completedButtonText: {
        color: '#ffffff',
    },
});
