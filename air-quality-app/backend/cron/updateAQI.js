const AQIData = require('../models/AQIData');
const { getCurrentAQI } = require('../services/aqiService');

/**
 * Major Indian cities to track with coordinates
 */
const MAJOR_CITIES = [
    { city: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 }
];

/**
 * Update AQI data for major cities
 * Runs every 30 minutes via cron
 */
async function updateAQI() {
    console.log('🔄 Starting AQI update cron job...');

    for (const location of MAJOR_CITIES) {
        try {
            await getCurrentAQI(location.city, location.state, location.lat, location.lon);
            console.log(`✅ Updated AQI for ${location.city}`);
        } catch (error) {
            console.error(`❌ Failed to update AQI for ${location.city}:`, error.message);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ AQI update cron job completed');
}

module.exports = updateAQI;
