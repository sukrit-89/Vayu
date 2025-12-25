import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AQICard from '../components/AQICard';
import { useAuth } from '../context/AuthContext';
import { aqiAPI, newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const [aqiData, setAqiData] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch AQI for user's location
            if (user?.location) {
                try {
                    const aqiResponse = await aqiAPI.getCurrent(
                        user.location.city,
                        user.location.state,
                        user.location.lat,
                        user.location.lon
                    );
                    setAqiData(aqiResponse.data.data);
                } catch (aqiError) {
                    console.error('AQI error:', aqiError);
                    // Don't block news if AQI fails
                }
            }

            // Fetch latest news (independent of AQI)
            try {
                const newsResponse = await newsAPI.getLatest();
                setNews(newsResponse.data.news.slice(0, 3)); // Show only first 3
            } catch (newsError) {
                console.error('News error:', newsError);
                Alert.alert('Info', 'Could not load latest news');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
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
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
                    <Text style={styles.subheading}>Check your air quality today</Text>
                </View>

                {/* AQI Card */}
                {aqiData && (
                    <AQICard
                        aqi={aqiData.aqi}
                        city={aqiData.city}
                        state={aqiData.state}
                    />
                )}

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Chat')}
                    >
                        <Ionicons name="chatbubbles" size={24} color="#3b82f6" />
                        <Text style={styles.actionText}>Health Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Community')}
                    >
                        <Ionicons name="people" size={24} color="#10b981" />
                        <Text style={styles.actionText}>Take Action</Text>
                    </TouchableOpacity>
                </View>

                {/* Health Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Health Tips</Text>
                    <View style={styles.tipsContainer}>
                        {aqiData && aqiData.aqi > 100 && (
                            <>
                                <View style={styles.tip}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                    <Text style={styles.tipText}>Wear an N95 mask when going outside</Text>
                                </View>
                                <View style={styles.tip}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                    <Text style={styles.tipText}>Keep windows closed during peak pollution hours</Text>
                                </View>
                                <View style={styles.tip}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                    <Text style={styles.tipText}>Use indoor air purifiers</Text>
                                </View>
                            </>
                        )}
                        {aqiData && aqiData.aqi <= 100 && (
                            <View style={styles.tip}>
                                <Ionicons name="sunny" size={20} color="#fbbf24" />
                                <Text style={styles.tipText}>Air quality is good! Enjoy outdoor activities 😊</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Latest News */}
                {news.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Latest News</Text>
                        {news.map((item) => (
                            <NewsCard key={item.id} news={item} />
                        ))}
                    </View>
                )}
            </ScrollView>
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
        padding: 20,
        paddingTop: 10,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subheading: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginTop: 16,
    },
    actionButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        flex: 0.45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    section: {
        marginTop: 24,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    tipsContainer: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    tipText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
});
