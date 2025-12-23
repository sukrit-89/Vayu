require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/auth');
const aqiRoutes = require('./routes/aqi');
const chatRoutes = require('./routes/chat');
const communityRoutes = require('./routes/community');
const productsRoutes = require('./routes/products');
const newsRoutes = require('./routes/news');
const notificationsRoutes = require('./routes/notifications');

// Import cron jobs
const updateAQI = require('./cron/updateAQI');
const sendAlerts = require('./cron/sendAlerts');
const updateNews = require('./cron/updateNews');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Air Quality API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            aqi: '/api/aqi',
            chat: '/api/chat',
            community: '/api/community',
            products: '/api/products',
            news: '/api/news',
            notifications: '/api/notifications'
        }
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Redis connection is handled in config/redis.js

        // Start cron jobs
        console.log('⏰ Setting up cron jobs...');

        // Update AQI every 30 minutes
        cron.schedule('*/30 * * * *', updateAQI);
        console.log('✅ AQI update cron scheduled (every 30 minutes)');

        // Send alerts every hour
        cron.schedule('0 * * * *', sendAlerts);
        console.log('✅ Alert check cron scheduled (every hour)');

        // Update news every 6 hours
        cron.schedule('0 */6 * * *', updateNews);
        console.log('✅ News update cron scheduled (every 6 hours)');

        // Run initial updates
        setTimeout(async () => {
            console.log('🚀 Running initial data fetch...');
            await updateAQI();
            await updateNews();
        }, 5000);

        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📡 API endpoint: http://localhost:${PORT}`);
            console.log(`📚 Health check: http://localhost:${PORT}/\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});
