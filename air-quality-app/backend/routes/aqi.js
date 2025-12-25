const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getCurrentAQI, getForecast } = require('../services/aqiService');

/**
 * GET /api/aqi/current?city=Delhi&state=Delhi
 * Get current AQI for a location
 */
router.get('/current', async (req, res) => {
    try {
        const { city, state, lat, lon } = req.query;

        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        // Pass lat/lon if provided (for OpenWeatherMap)
        const latitude = lat ? parseFloat(lat) : null;
        const longitude = lon ? parseFloat(lon) : null;

        const data = await getCurrentAQI(city, state, latitude, longitude);

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.log('AQI fetch error:', error);
        res.status(500).json({ error: error.message });
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
