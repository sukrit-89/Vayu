const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getCurrentAQI, getForecast } = require('../services/aqiService');
const { geocodeCity } = require('../services/openweatherHelper');

/**
 * GET /api/aqi/current?city=Delhi&state=Delhi
 * Get current AQI for a location
 */
router.get('/current', async (req, res) => {
    try {
        const { city, state, lat, lon } = req.query;

        // Require either city OR coordinates
        if (!city && (!lat || !lon)) {
            return res.status(400).json({ error: 'Either city or coordinates (lat & lon) are required' });
        }

        // Pass lat/lon if provided (for OpenWeatherMap)
        const latitude = lat ? parseFloat(lat) : null;
        const longitude = lon ? parseFloat(lon) : null;

        const data = await getCurrentAQI(city || 'Unknown', state, latitude, longitude);

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

/**
 * GET /api/aqi/hourly?city=Mumbai&lat=19.076&lon=72.877
 * Get hourly AQI forecast for next 24 hours
 */
router.get('/hourly', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;

        if (!city || !lat || !lon) {
            return res.status(400).json({
                error: 'City, latitude, and longitude are required'
            });
        }

        const { fetchHourlyForecast } = require('../services/openweatherHelper');
        const data = await fetchHourlyForecast(
            parseFloat(lat),
            parseFloat(lon),
            city
        );

        res.json({
            success: true,
            city,
            hourly: data.hourly
        });

    } catch (error) {
        console.error('Hourly forecast error:', error);
        res.status(500).json({
            error: 'Unable to fetch hourly forecast',
            message: error.message
        });
    }
});

/**
 * GET /api/aqi/geocode?city=Mumbai&state=Maharashtra
 * Get coordinates for a city
 */
router.get('/geocode', async (req, res) => {
    try {
        const { city, state } = req.query;

        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        const location = await geocodeCity(city, state);

        res.json({
            success: true,
            location
        });

    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({
            error: 'Unable to geocode location',
            message: error.message
        });
    }
});

module.exports = router;
