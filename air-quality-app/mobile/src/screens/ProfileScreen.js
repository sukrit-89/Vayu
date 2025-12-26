import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const getAQICategory = (aqi) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]
        );
    };

    const settingsSections = [
        {
            title: 'Account',
            items: [
                { icon: 'person-outline', label: 'Name', value: user?.name },
                { icon: 'mail-outline', label: 'Email', value: user?.email },
                { icon: 'location-outline', label: 'Location', value: user?.location?.city },
            ],
        },
        {
            title: 'Preferences',
            items: [
                { icon: 'language-outline', label: 'Language', value: user?.language === 'hi' ? 'Hindi' : 'English' },
                { icon: 'alert-circle-outline', label: 'AQI Alert Threshold', value: user?.aqi_threshold },
            ],
        },
        {
            title: 'Health',
            items: [
                {
                    icon: 'medical-outline',
                    label: 'Health Conditions',
                    value: user?.health_conditions?.length > 0
                        ? user.health_conditions.join(', ')
                        : 'None'
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Ionicons name="person-circle" size={28} color="#3b82f6" />
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color="#ffffff" />
                    </View>
                    <Text style={styles.profileName}>{user?.name}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                {/* Settings Sections */}
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.items.map((item, itemIndex) => (
                            <View key={itemIndex} style={styles.settingItem}>
                                <View style={styles.settingLeft}>
                                    <Ionicons name={item.icon} size={24} color="#6b7280" />
                                    <Text style={styles.settingLabel}>{item.label}</Text>
                                </View>
                                <Text style={styles.settingValue} numberOfLines={1}>
                                    {item.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
                            <Text style={styles.settingLabel}>AQI Alerts</Text>
                        </View>
                        <Ionicons
                            name={user?.notification_settings?.aqi_alerts ? 'checkmark-circle' : 'close-circle'}
                            size={24}
                            color={user?.notification_settings?.aqi_alerts ? '#10b981' : '#ef4444'}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="mail-outline" size={24} color="#6b7280" />
                            <Text style={styles.settingLabel}>Daily Summary</Text>
                        </View>
                        <Ionicons
                            name={user?.notification_settings?.daily_summary ? 'checkmark-circle' : 'close-circle'}
                            size={24}
                            color={user?.notification_settings?.daily_summary ? '#10b981' : '#ef4444'}
                        />
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="create-outline" size={24} color="#3b82f6" />
                        <Text style={styles.actionText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                        <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Air Quality App v1.0.0</Text>
                    <Text style={styles.footerText}>Powered by CPCB Data</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
    profileHeader: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    profileEmail: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    section: {
        marginTop: 24,
        backgroundColor: '#ffffff',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 12,
    },
    settingValue: {
        fontSize: 16,
        color: '#6b7280',
        maxWidth: '50%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    actionText: {
        fontSize: 16,
        color: '#3b82f6',
        marginLeft: 12,
        fontWeight: '500',
    },
    logoutText: {
        color: '#ef4444',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        marginVertical: 2,
    },
});
