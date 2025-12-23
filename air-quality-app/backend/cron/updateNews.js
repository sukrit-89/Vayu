const { fetchNews } = require('../services/newsService');

/**
 * Update news articles and summaries
 * Runs every 6 hours via cron
 */
async function updateNews() {
    console.log('🔄 Starting news update cron job...');

    try {
        await fetchNews();
        console.log('✅ News update cron job completed');
    } catch (error) {
        console.error('❌ News update cron job failed:', error.message);
    }
}

module.exports = updateNews;
