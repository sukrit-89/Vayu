require('dotenv').config();
const redis = require('./config/redis');

async function clearCache() {
    try {
        console.log('🗑️ Clearing Redis cache...');

        // Clear all keys matching aqi:*
        const keys = await redis.keys('aqi:*');

        if (keys.length > 0) {
            console.log(`Found ${keys.length} cached AQI keys`);
            await redis.del(...keys);
            console.log('✅ Cache cleared!');
        } else {
            console.log('No cached keys found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

clearCache();
