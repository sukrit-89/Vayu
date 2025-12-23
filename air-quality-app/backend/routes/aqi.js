const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getCurrentAQI, getForecast } = require('../services/aqiService');

/**
 * GET /api/aqi/current?city=Delhi&state=Delhi
 * Get current AQI for a location
 */
router.get('/current', verifyToken, async (req, res) => {
    try {
        const { city, state } = req.query;

        if (!city) {
            return res.status(400).json({ error: 'City parameter required' });
        }

        const aqiData = await getCurrentAQI(city, state);

        res.json({
            success: true,
            data: aqiData
        });

    } catch (error) {
        console.error('AQI fetch error:', error);
        res.status(500).json({ error: 'Unable to fetch AQI data', message: error.message });
    }
});

/**
 * GET /api/aqi/forecast?city=Delhi
 * Get 24-hour AQI forecast for a location
 */
router.get('/forecast', verifyToken, async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ error: 'City parameter required' });
        }

        const forecast = await getForecast(city);

        res.json({
            success: true,
            city,
            forecast
        });

    } catch (error) {
        console.error('Forecast error:', error);
        res.status(500).json({ error: 'Unable to generate forecast', message: error.message });
    }
});

module.exports = router;
