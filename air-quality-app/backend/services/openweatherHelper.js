const axios = require('axios');
const redis = require('../config/redis');
const AQIData = require('../models/AQIData');

/**
 * Convert OpenWeatherMap AQI (1-5) to US AQI (0-500)
 */
function convertOpenWeatherAQI(owmAqi) {
    // OpenWeatherMap scale: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    // Convert to approximate US AQI values
    const aqiMap = {
        1: 25,   // Good (0-50)
        2: 75,   // Fair (51-100)
        3: 125,  // Moderate (101-150)
        4: 200,  // Poor (151-200)
        5: 350   // Very Poor (201-300+)
    };
    return aqiMap[owmAqi] || 100;
}

/**
 * Fetch AQI from OpenWeatherMap (works worldwide by lat/lon)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude  
 * @param {string} city - City name (for display/caching)
 * @returns {Object} AQI data
 */
async function fetchFromOpenWeather(lat, lon, city) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENWEATHER_API_KEY not configured');
        }

        const url = 'https://api.openweathermap.org/data/2.5/air_pollution';
        const response = await axios.get(url, {
            params: {
                lat,
                lon,
                appid: apiKey
            }
        });

        if (!response.data || !response.data.list || response.data.list.length === 0) {
            throw new Error('No data from OpenWeatherMap');
        }

        const data = response.data.list[0];
        const owmAqi = data.main.aqi;
        const components = data.components;

        // Convert to US AQI scale
        const aqi = convertOpenWeatherAQI(owmAqi);

        return {
            city,
            aqi,
            pollutants: {
                pm25: Math.round(components.pm2_5 || 0),
                pm10: Math.round(components.pm10 || 0),
                no2: Math.round(components.no2 || 0),
                so2: Math.round(components.so2 || 0),
                co: Math.round(components.co / 100 || 0), // Convert to reasonable range
                o3: Math.round(components.o3 || 0)
            },
            source: 'OpenWeatherMap',
            last_update: new Date().toISOString()
        };

    } catch (error) {
        console.error(`OpenWeatherMap fetch failed for ${city}:`, error.message);
        throw error;
    }
}

module.exports = {
    fetchFromOpenWeather,
    convertOpenWeatherAQI
};
