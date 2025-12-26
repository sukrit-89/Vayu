const axios = require('axios');
const redis = require('../config/redis');
const AQIData = require('../models/AQIData');
const { fetchFromOpenWeather, fetchFromWAQI } = require('./openweatherHelper');

/**
 * Get current AQI data with multi-source fallback
 * Priority: WAQI (India monitoring stations) → OpenWeatherMap (Global) → MongoDB cache
 * @param {string} city - City name
 * @param {string} state - State name (optional)
 * @param {number} lat - Latitude (from user profile)
 * @param {number} lon - Longitude (from user profile)
 * @returns {Object} AQI data with pollutants
 */
async function getCurrentAQI(city, state = '', lat = null, lon = null) {
    try {
        // REAL-TIME DATA: No cache - always fetch fresh AQI
        let result = null;

        // Strategy 1: Try WAQI (accurate for India with real monitoring stations)
        try {
            console.log(`🌏 Trying WAQI for ${city}`);
            result = await fetchFromWAQI(city);
            result.state = state; // Add state from user
            console.log(`✅ WAQI: ${city} AQI = ${result.aqi}`);
        } catch (waqiError) {
            console.log(`⚠️ WAQI failed for ${city}: ${waqiError.message}`);
        }

        // Strategy 2: Try OpenWeatherMap (if WAQI failed and lat/lon available)
        if (!result && lat && lon) {
            try {
                console.log(`🌍 Trying OpenWeatherMap for ${city} (${lat}, ${lon})`);
                result = await fetchFromOpenWeather(lat, lon, city);
                result.state = state;
                console.log(`✅ OpenWeatherMap: ${city} AQI = ${result.aqi}`);
            } catch (owmError) {
                console.log(`⚠️ OpenWeatherMap failed for ${city}: ${owmError.message}`);
            }
        }

        // Strategy 3: If both APIs failed, try MongoDB cache
        if (!result) {
            const fallback = await AQIData.findOne({ city })
                .sort({ timestamp: -1 })
                .limit(1);

            if (fallback) {
                console.log(`💾 Using MongoDB cache for ${city}`);
                return {
                    city: fallback.city,
                    state: fallback.state,
                    station: fallback.station,
                    aqi: fallback.aqi,
                    pollutants: fallback.pollutants,
                    last_update: fallback.timestamp,
                    source: 'cached_db'
                };
            }

            throw new Error(`Unable to fetch AQI data for ${city}`);
        }

        // Store in MongoDB for historical analysis only (not for caching)
        const now = new Date();
        await AQIData.create({
            city: result.city,
            state: result.state,
            station: result.station || 'Unknown',
            location: { lat: lat || 0, lon: lon || 0 },
            aqi: result.aqi,
            pollutants: result.pollutants,
            timestamp: now,
            hour: now.getHours(),
            day_of_week: now.getDay(),
            month: now.getMonth() + 1
        });

        return result;

    } catch (error) {
        console.error(`❌ Error fetching AQI for ${city}:`, error.message);
        throw error;
    }
}

/**
 * Get 24-hour forecast using historical data and simple moving average
 * @param {string} city - City name
 * @returns {Array} Array of hourly forecast objects
 */
async function getForecast(city) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const historicalData = await AQIData.find({
            city,
            timestamp: { $gte: sevenDaysAgo }
        }).sort({ timestamp: 1 });

        if (historicalData.length === 0) {
            throw new Error('Insufficient historical data for forecast');
        }

        const hourlyAverages = {};

        historicalData.forEach(record => {
            const hour = record.hour;
            if (!hourlyAverages[hour]) {
                hourlyAverages[hour] = { sum: 0, count: 0 };
            }
            hourlyAverages[hour].sum += record.aqi;
            hourlyAverages[hour].count += 1;
        });

        const forecast = [];
        const currentHour = new Date().getHours();

        for (let i = 0; i < 24; i++) {
            const forecastHour = (currentHour + i) % 24;
            const avg = hourlyAverages[forecastHour];

            forecast.push({
                hour: forecastHour,
                aqi: avg ? Math.round(avg.sum / avg.count) : 100,
                timestamp: new Date(Date.now() + i * 60 * 60 * 1000)
            });
        }

        return forecast;

    } catch (error) {
        console.error(`❌ Error generating forecast for ${city}:`, error.message);
        throw error;
    }
}

module.exports = {
    getCurrentAQI,
    getForecast
};
