import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionCard from '../components/ActionCard';
import { communityAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityScreen() {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        try {
            const response = await communityAPI.getActions();
            setActions(response.data.actions);
        } catch (error) {
            console.error('Error fetching actions:', error);
            Alert.alert('Error', 'Failed to load community actions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleComplete = async (actionId) => {
        try {
            await communityAPI.completeAction(actionId);

            // Update local state
            setActions((prev) =>
                prev.map((action) =>
                    action.id === actionId
                        ? {
                            ...action,
                            is_completed_by_user: true,
                            completed_count: action.completed_count + 1,
                        }
                        : action
                )
            );

            Alert.alert('Success', 'Thank you for taking action! 🎉');
        } catch (error) {
            console.error('Error completing action:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to complete action');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchActions();
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Ionicons name="people" size={28} color="#10b981" />
                <Text style={styles.headerTitle}>Community Actions</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                    🌍 Join hands with the community to fight air pollution!
                </Text>
            </View>

            <FlatList
                data={actions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ActionCard
                        action={item}
                        onComplete={handleComplete}
                        isCompleted={item.is_completed_by_user}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>No actions available yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
        color: '#1f2937',
    },
    infoCard: {
        backgroundColor: '#ecfdf5',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    infoText: {
        fontSize: 14,
        color: '#047857',
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9ca3af',
    },
});
