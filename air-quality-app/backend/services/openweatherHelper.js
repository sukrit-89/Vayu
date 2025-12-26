const axios = require('axios');
const redis = require('../config/redis');
const AQIData = require('../models/AQIData');

/**
 * Calculate Indian AQI (NAQI) from PM2.5 concentration
 * Uses CPCB (Central Pollution Control Board) breakpoints
 */
function calculateIndianAQIFromPM25(pm25) {
    // Indian CPCB NAQI breakpoints for PM2.5 (24-hour average)
    const breakpoints = [
        { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },       // Good
        { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },    // Satisfactory
        { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },   // Moderate
        { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },  // Poor
        { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 }, // Very Poor
        { cLow: 251, cHigh: 380, iLow: 401, iHigh: 500 }  // Severe
    ];

    // Find the appropriate breakpoint
    let bp;
    for (let i = 0; i < breakpoints.length; i++) {
        if (pm25 >= breakpoints[i].cLow && pm25 <= breakpoints[i].cHigh) {
            bp = breakpoints[i];
            break;
        }
    }

    // If beyond max (>380), cap at 500
    if (!bp) {
        if (pm25 > 380) {
            return 500;
        }
        bp = breakpoints[breakpoints.length - 1];
    }

    // Calculate AQI using Indian NAQI formula
    const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
    return Math.round(aqi);
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
        const components = data.components;

        // Calculate Indian AQI (NAQI) from PM2.5 concentration
        const aqi = calculateIndianAQIFromPM25(components.pm2_5);

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

/**
 * Fetch AQI from WAQI (World Air Quality Index) - Accurate for India
 * Uses real monitoring station data from CPCB and other networks
 * @param {string} city - City name
 * @param {string} country - Country (default: 'india')
 * @returns {Object} AQI data
 */
async function fetchFromWAQI(city, country = 'india') {
    try {
        const apiKey = process.env.WAQI_API_KEY;
        if (!apiKey) {
            throw new Error('WAQI_API_KEY not configured');
        }

        // WAQI uses city name format: "city" or "city/country"
        const searchQuery = country === 'india' ? city.toLowerCase() : `${city}/${country}`;

        const response = await axios.get(
            `https://api.waqi.info/feed/${searchQuery}/`,
            {
                params: { token: apiKey },
                timeout: 10000
            }
        );

        if (response.data.status !== 'ok' || !response.data.data) {
            throw new Error(`WAQI: No data for ${city}`);
        }

        const data = response.data.data;

        // WAQI already returns Indian CPCB AQI - no conversion needed!
        return {
            city: data.city.name.split(',')[0].trim(), // Extract city name
            aqi: data.aqi,
            pollutants: {
                pm25: Math.round(data.iaqi?.pm25?.v || 0),
                pm10: Math.round(data.iaqi?.pm10?.v || 0),
                no2: Math.round(data.iaqi?.no2?.v || 0),
                so2: Math.round(data.iaqi?.so2?.v || 0),
                co: Math.round(data.iaqi?.co?.v || 0),
                o3: Math.round(data.iaqi?.o3?.v || 0)
            },
            source: 'WAQI',
            last_update: data.time.iso || new Date().toISOString()
        };

    } catch (error) {
        console.error(`WAQI fetch failed for ${city}:`, error.message);
        throw error;
    }
}

/**
 * Fetch hourly AQI forecast for the next 24 hours
 */
async function fetchHourlyForecast(lat, lon, city) {
    try {
        if (!process.env.OPENWEATHER_API_KEY) {
            throw new Error('OPENWEATHER_API_KEY not configured');
        }

        const response = await axios.get(
            'https://api.openweathermap.org/data/2.5/air_pollution/forecast',
            {
                params: {
                    lat,
                    lon,
                    appid: process.env.OPENWEATHER_API_KEY
                },
                timeout: 10000
            }
        );

        if (!response.data || !response.data.list) {
            throw new Error('No forecast data returned from OpenWeatherMap');
        }

        // Get next 24 hours (OpenWeatherMap returns 5-day forecast)
        const hourly = response.data.list.slice(0, 24).map(item => {
            const aqi = calculateIndianAQIFromPM25(item.components.pm2_5);
            return {
                time: new Date(item.dt * 1000).toISOString(),
                aqi,
                pm25: Math.round(item.components.pm2_5),
                pm10: Math.round(item.components.pm10)
            };
        });

        return {
            city,
            hourly
        };

    } catch (error) {
        console.error(`Hourly forecast fetch failed for ${city}:`, error.message);
        throw error;
    }
}

/**
 * Geocode a city name to get lat/lon coordinates
 */
async function geocodeCity(city, state, country = 'IN') {
    try {
        if (!process.env.OPENWEATHER_API_KEY) {
            throw new Error('OPENWEATHER_API_KEY not configured');
        }

        // Build location query
        const query = state ? `${city},${state},${country}` : `${city},${country}`;

        const response = await axios.get(
            'https://api.openweathermap.org/geo/1.0/direct',
            {
                params: {
                    q: query,
                    limit: 1,
                    appid: process.env.OPENWEATHER_API_KEY
                },
                timeout: 5000
            }
        );

        if (!response.data || response.data.length === 0) {
            throw new Error(`City not found: ${city}`);
        }

        const location = response.data[0];
        return {
            city: location.name,
            state: location.state || '',
            country: location.country,
            lat: location.lat,
            lon: location.lon
        };

    } catch (error) {
        console.error(`Geocoding failed for ${city}:`, error.message);
        throw error;
    }
}

module.exports = {
    fetchFromOpenWeather,
    fetchFromWAQI,
    fetchHourlyForecast,
    geocodeCity
};
