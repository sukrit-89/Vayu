const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { fetchNews } = require('../services/newsService');

/**
 * GET /api/news/latest
 * Get latest AI-summarized news articles
 */
router.get('/latest', verifyToken, async (req, res) => {
    try {
        const news = await fetchNews();

        res.json({
            success: true,
            count: news.length,
            news
        });

    } catch (error) {
        console.error('News fetch error:', error);
        res.status(500).json({ error: 'Unable to fetch news' });
    }
});

module.exports = router;
