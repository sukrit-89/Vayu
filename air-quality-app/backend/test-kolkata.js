require('dotenv').config();
const { fetchFromOpenWeather } = require('./services/openweatherHelper');

async function testKolkata() {
    console.log('🧪 Testing AQI for Kolkata...\n');

    try {
        const result = await fetchFromOpenWeather(22.5726, 88.3639, 'Kolkata');

        console.log('✅ SUCCESS! Kolkata AQI Retrieved!\n');
        console.log(`📍 City: ${result.city}`);
        console.log(`🌫️  AQI: ${result.aqi} (${getAQICategory(result.aqi)})`);
        console.log(`📊 Pollutants:`);
        console.log(`   PM2.5: ${result.pollutants.pm25} µg/m³`);
        console.log(`   PM10:  ${result.pollutants.pm10} µg/m³`);
        console.log(`   NO2:   ${result.pollutants.no2} µg/m³`);
        console.log(`   SO2:   ${result.pollutants.so2} µg/m³`);
        console.log(`   O3:    ${result.pollutants.o3} µg/m³`);
        console.log(`📡 Source: ${result.source}`);

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    }
}

function getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

testKolkata();
