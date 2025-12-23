const User = require('../models/User');
const Alert = require('../models/Alert');
const { getCurrentAQI } = require('./aqiService');

/**
 * Send AQI alert notification to user via Expo Push Notifications
 * Note: This is a placeholder. Actual implementation requires Expo Server SDK
 * @param {string} userId - User ID
 * @param {number} aqiValue - Current AQI value
 * @param {string} message - Alert message
 */
async function sendAQIAlert(userId, aqiValue, message) {
    try {
        const user = await User.findById(userId);

        if (!user || !user.expo_push_token) {
            console.log(`No push token for user ${userId}`);
            return;
        }

        if (!user.notification_settings.aqi_alerts) {
            console.log(`User ${userId} has disabled AQI alerts`);
            return;
        }

        // Create alert record
        await Alert.create({
            user_id: userId,
            aqi_value: aqiValue,
            type: 'threshold_exceeded',
            message
        });

        // TODO: Implement actual Expo push notification
        // const { Expo } = require('expo-server-sdk');
        // const expo = new Expo();
        // await expo.sendPushNotificationsAsync([{
        //   to: user.expo_push_token,
        //   sound: 'default',
        //   title: 'Air Quality Alert',
        //   body: message,
        //   data: { aqi: aqiValue }
        // }]);

        console.log(`✅ Alert sent to user ${userId}: ${message}`);

    } catch (error) {
        console.error(`❌ Error sending alert to user ${userId}:`, error.message);
    }
}

/**
 * Check all users and send alerts if AQI exceeds their threshold
 */
async function checkAndSendAlerts() {
    try {
        const users = await User.find({
            expo_push_token: { $ne: null },
            'notification_settings.aqi_alerts': true
        });

        console.log(`Checking alerts for ${users.length} users...`);

        for (const user of users) {
            try {
                const aqiData = await getCurrentAQI(user.location.city, user.location.state);

                if (aqiData.aqi >= user.aqi_threshold) {
                    const aqiLevel = aqiData.aqi <= 200 ? 'Unhealthy' :
                        aqiData.aqi <= 300 ? 'Very Unhealthy' : 'Hazardous';

                    const message = `⚠️ Air quality in ${user.location.city} is ${aqiLevel} (AQI: ${aqiData.aqi}). Stay indoors and wear a mask if going out.`;

                    await sendAQIAlert(user._id, aqiData.aqi, message);
                }
            } catch (error) {
                console.error(`Error checking alert for user ${user._id}:`, error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error in checkAndSendAlerts:', error.message);
    }
}

module.exports = {
    sendAQIAlert,
    checkAndSendAlerts
};
