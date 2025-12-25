const axios = require('axios');
const redis = require('../config/redis');
const AQIData = require('../models/AQIData');
const { fetchFromOpenWeather } = require('./openweatherHelper');

/**
 * Get current AQI data with multi-source fallback
 * Priority: OpenWeatherMap (worldwide) → CPCB (India major cities) → MongoDB cache
 * @param {string} city - City name
 * @param {string} state - State name (optional)
 * @param {number} lat - Latitude (from user profile)
 * @param {number} lon - Longitude (from user profile)
 * @returns {Object} AQI data with pollutants
 */
async function getCurrentAQI(city, state = '', lat = null, lon = null) {
    const cacheKey = `aqi:${city}:${state}`;

    try {
        // Check Redis cache first
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`✅ Cache hit for ${city}`);
            return JSON.parse(cached);
        }

        let result = null;

        // Strategy 1: Try OpenWeatherMap (if lat/lon available)
        if (lat && lon) {
            try {
                console.log(`🌍 Trying OpenWeatherMap for ${city} (${lat}, ${lon})`);
                result = await fetchFromOpenWeather(lat, lon, city);
                result.state = state; // Add state from user
                console.log(`✅ OpenWeatherMap: ${city} AQI = ${result.aqi}`);
            } catch (owmError) {
                console.log(`⚠️ OpenWeatherMap failed for ${city}: ${owmError.message}`);
            }
        }

        // Strategy 2: Fallback to CPCB API (India major cities only)
        if (!result) {
            try {
                console.log(`🇮🇳 Trying CPCB for ${city}`);
                const apiKey = process.env.CPCB_API_KEY;
                const resourceId = process.env.CPCB_RESOURCE_ID;

                const url = `https://api.data.gov.in/resource/${resourceId}`;
                const params = {
                    'api-key': apiKey,
                    format: 'json',
                    limit: 10
                };

                if (city) params['filters[city]'] = city;
                if (state) params['filters[state]'] = state;

                const response = await axios.get(url, { params });

                if (!response.data || !response.data.records || response.data.records.length === 0) {
                    throw new Error(`No CPCB data found for ${city}`);
                }

                const records = response.data.records;
                const pollutantSums = { pm25: 0, pm10: 0, no2: 0, so2: 0, co: 0, o3: 0 };

                records.forEach(record => {
                    const pollutantId = record.pollutant_id;
                    const pollutantAvg = parseFloat(record.pollutant_avg) || 0;

                    if (pollutantId === 'PM2.5') pollutantSums.pm25 += pollutantAvg;
                    else if (pollutantId === 'PM10') pollutantSums.pm10 += pollutantAvg;
                    else if (pollutantId === 'NO2') pollutantSums.no2 += pollutantAvg;
                    else if (pollutantId === 'SO2') pollutantSums.so2 += pollutantAvg;
                    else if (pollutantId === 'CO') pollutantSums.co += pollutantAvg;
                    else if (pollutantId === 'Ozone') pollutantSums.o3 += pollutantAvg;
                });

                const aqi = Math.max(
                    pollutantSums.pm25, pollutantSums.pm10, pollutantSums.no2,
                    pollutantSums.so2, pollutantSums.co, pollutantSums.o3
                );

                result = {
                    city: records[0].city || city,
                    state: records[0].state || state,
                    station: records[0].station || 'Multiple Stations',
                    aqi: Math.round(aqi),
                    pollutants: {
                        pm25: Math.round(pollutantSums.pm25),
                        pm10: Math.round(pollutantSums.pm10),
                        no2: Math.round(pollutantSums.no2),
                        so2: Math.round(pollutantSums.so2),
                        co: Math.round(pollutantSums.co),
                        o3: Math.round(pollutantSums.o3)
                    },
                    source: 'CPCB',
                    last_update: records[0].last_update || new Date().toISOString()
                };

                console.log(`✅ CPCB: ${city} AQI = ${result.aqi}`);

            } catch (cpcbError) {
                console.error(`❌ CPCB also failed for ${city}:`, cpcbError.message);
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

        // Cache for 10 minutes
        await redis.setEx(cacheKey, 600, JSON.stringify(result));

        // Store in MongoDB for historical analysis
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
