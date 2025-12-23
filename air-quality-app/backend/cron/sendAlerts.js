const { checkAndSendAlerts } = require('../services/notificationService');

/**
 * Check user AQI thresholds and send alerts
 * Runs every hour via cron
 */
async function sendAlerts() {
    console.log('🔄 Starting alert check cron job...');

    try {
        await checkAndSendAlerts();
        console.log('✅ Alert check cron job completed');
    } catch (error) {
        console.error('❌ Alert check cron job failed:', error.message);
    }
}

module.exports = sendAlerts;
