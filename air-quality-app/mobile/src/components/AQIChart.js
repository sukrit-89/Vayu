import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const AQIChart = ({ hourlyData }) => {
    if (!hourlyData || hourlyData.length === 0) {
        return null;
    }

    // Prepare data for chart
    const labels = hourlyData.map((item, index) => {
        const hour = new Date(item.time).getHours();
        // Show every 3rd hour to avoid crowding
        return index % 3 === 0 ? `${hour}:00` : '';
    });

    const data = hourlyData.map(item => item.aqi);

    // Get AQI color based on value
    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#10b981'; // Good - Green
        if (aqi <= 100) return '#f59e0b'; // Moderate - Yellow
        if (aqi <= 150) return '#f97316'; // Unhealthy for Sensitive - Orange
        if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
        if (aqi <= 300) return '#9333ea'; // Very Unhealthy - Purple
        return '#7f1d1d'; // Hazardous - Maroon
    };

    const avgAQI = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
    const maxAQI = Math.max(...data);
    const minAQI = Math.min(...data);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Today's AQI Trend</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                    data={{
                        labels,
                        datasets: [{
                            data,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                            strokeWidth: 2
                        }]
                    }}
                    width={Dimensions.get('window').width * 1.5} // Wider for scrolling
                    height={220}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#f8fafc',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: '#3b82f6'
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </ScrollView>

            {/* Stats */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Min</Text>
                    <Text style={[styles.statValue, { color: getAQIColor(minAQI) }]}>
                        {minAQI}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Avg</Text>
                    <Text style={[styles.statValue, { color: getAQIColor(avgAQI) }]}>
                        {avgAQI}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Max</Text>
                    <Text style={[styles.statValue, { color: getAQIColor(maxAQI) }]}>
                        {maxAQI}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default AQIChart;
