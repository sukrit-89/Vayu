require('dotenv').config();
const { fetchFromOpenWeather } = require('./services/openweatherHelper');

async function testOpenWeather() {
    console.log('🧪 Testing OpenWeatherMap API for Durgapur...\n');

    try {
        const result = await fetchFromOpenWeather(23.55, 87.32, 'Durgapur');

        console.log('✅ SUCCESS! OpenWeatherMap is working!\n');
        console.log(`📍 City: ${result.city}`);
        console.log(`🌫️  AQI: ${result.aqi} (${getAQICategory(result.aqi)})`);
        console.log(`📊 Pollutants:`);
        console.log(`   PM2.5: ${result.pollutants.pm25} µg/m³`);
        console.log(`   PM10:  ${result.pollutants.pm10} µg/m³`);
        console.log(`   NO2:   ${result.pollutants.no2} µg/m³`);
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
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

testOpenWeather();
