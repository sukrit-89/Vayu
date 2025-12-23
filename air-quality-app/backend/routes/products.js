const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const ProductClick = require('../models/ProductClick');

// Product recommendations database (could be moved to MongoDB)
const PRODUCTS = [
    // Free products
    {
        id: 'free-1',
        name: 'Indoor Plants (Money Plant, Snake Plant)',
        description: 'Natural air purifiers for your home',
        category: 'plant',
        budget: 'free',
        price: 0,
        url: 'https://www.google.com/search?q=air+purifying+indoor+plants+India',
        image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7'
    },
    {
        id: 'free-2',
        name: 'DIY Window Sealing',
        description: 'Use wet cloth/newspapers to seal windows',
        category: 'other',
        budget: 'free',
        price: 0,
        url: 'https://www.google.com/search?q=diy+window+sealing+air+pollution',
        image: 'https://images.unsplash.com/photo-1565183928294-7d22f2d45655'
    },
    // Affordable masks
    {
        id: 'mask-1',
        name: 'N95 Mask (Pack of 5)',
        description: 'NIOSH approved N95 respirator masks',
        category: 'mask',
        budget: 'under-500',
        price: 299,
        url: 'https://www.amazon.in/s?k=n95+mask',
        image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5'
    },
    {
        id: 'mask-2',
        name: 'Vogmask N99 Reusable Mask',
        description: 'Washable and reusable air pollution mask',
        category: 'mask',
        budget: 'under-1000',
        price: 899,
        url: 'https://www.amazon.in/s?k=vogmask+n99',
        image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde'
    },
    // Air purifiers
    {
        id: 'purifier-1',
        name: 'Mi Air Purifier 3',
        description: 'HEPA filter, covers 484 sq ft',
        category: 'purifier',
        budget: 'under-10000',
        price: 8999,
        url: 'https://www.amazon.in/s?k=mi+air+purifier+3',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd'
    },
    {
        id: 'purifier-2',
        name: 'Philips AC1215 Air Purifier',
        description: 'VitaShield IPS, covers 678 sq ft',
        category: 'purifier',
        budget: 'premium',
        price: 12995,
        url: 'https://www.amazon.in/s?k=philips+air+purifier',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
    },
    // Supplements
    {
        id: 'supplement-1',
        name: 'Chyawanprash (Dabur)',
        description: 'Ayurvedic immunity booster',
        category: 'supplement',
        budget: 'under-500',
        price: 245,
        url: 'https://www.amazon.in/s?k=dabur+chyawanprash',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae'
    },
    // AQI Monitor
    {
        id: 'monitor-1',
        name: 'AQI Monitor - Temtop M10',
        description: 'Real-time PM2.5, PM10, AQI display',
        category: 'monitor',
        budget: 'under-5000',
        price: 4299,
        url: 'https://www.amazon.in/s?k=air+quality+monitor',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
    }
];

/**
 * GET /api/products/recommendations?budget=free
 * Get product recommendations filtered by budget
 */
router.get('/recommendations', verifyToken, async (req, res) => {
    try {
        const { budget, category } = req.query;

        let filteredProducts = [...PRODUCTS];

        // Filter by budget
        if (budget) {
            filteredProducts = filteredProducts.filter(p => p.budget === budget);
        }

        // Filter by category
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        // Sort: free products first, then by price
        filteredProducts.sort((a, b) => {
            if (a.price === 0 && b.price !== 0) return -1;
            if (a.price !== 0 && b.price === 0) return 1;
            return a.price - b.price;
        });

        res.json({
            success: true,
            products: filteredProducts
        });

    } catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ error: 'Unable to fetch products' });
    }
});

/**
 * POST /api/products/clicks
 * Track product click for analytics
 */
router.post('/clicks', verifyToken, async (req, res) => {
    try {
        const { product_id, product_name, product_url, category } = req.body;

        if (!product_id || !product_url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await ProductClick.create({
            user_id: req.userId,
            product_id,
            product_name: product_name || '',
            product_url,
            category: category || 'other'
        });

        res.json({
            success: true,
            message: 'Click tracked'
        });

    } catch (error) {
        console.error('Product click tracking error:', error);
        res.status(500).json({ error: 'Unable to track click' });
    }
});

module.exports = router;
