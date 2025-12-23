const redis = require('redis');

// Create Redis client
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Error handling
client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

// Connect to Redis
(async () => {
    try {
        await client.connect();
    } catch (error) {
        console.error('❌ Redis connection error:', error.message);
    }
})();

module.exports = client;
