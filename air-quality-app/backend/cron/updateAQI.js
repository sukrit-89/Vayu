const AQIData = require('../models/AQIData');
const { getCurrentAQI } = require('../services/aqiService');

/**
 * Major Indian cities to track
 */
const MAJOR_CITIES = [
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Lucknow', state: 'Uttar Pradesh' }
];

/**
 * Update AQI data for major cities
 * Runs every 30 minutes via cron
 */
async function updateAQI() {
    console.log('🔄 Starting AQI update cron job...');

    for (const location of MAJOR_CITIES) {
        try {
            await getCurrentAQI(location.city, location.state);
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
