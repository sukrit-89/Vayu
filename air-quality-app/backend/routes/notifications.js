const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const User = require('../models/User');

/**
 * POST /api/notifications/subscribe
 * Save user's Expo push token for notifications
 */
router.post('/subscribe', verifyToken, async (req, res) => {
    try {
        const { expo_push_token } = req.body;

        if (!expo_push_token) {
            return res.status(400).json({ error: 'Expo push token required' });
        }

        await User.findByIdAndUpdate(req.userId, {
            expo_push_token
        });

        res.json({
            success: true,
            message: 'Push token saved successfully'
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Unable to save push token' });
    }
});

/**
 * PUT /api/notifications/settings
 * Update user's notification preferences
 */
router.put('/settings', verifyToken, async (req, res) => {
    try {
        const { aqi_alerts, daily_summary, community_updates, aqi_threshold } = req.body;

        const updates = {};

        if (typeof aqi_alerts === 'boolean') {
            updates['notification_settings.aqi_alerts'] = aqi_alerts;
        }
        if (typeof daily_summary === 'boolean') {
            updates['notification_settings.daily_summary'] = daily_summary;
        }
        if (typeof community_updates === 'boolean') {
            updates['notification_settings.community_updates'] = community_updates;
        }
        if (aqi_threshold !== undefined) {
            updates.aqi_threshold = Math.max(0, Math.min(500, aqi_threshold));
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Settings updated successfully',
            notification_settings: user.notification_settings,
            aqi_threshold: user.aqi_threshold
        });

    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Unable to update settings' });
    }
});

module.exports = router;
