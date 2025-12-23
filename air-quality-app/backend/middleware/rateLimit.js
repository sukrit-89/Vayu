const rateLimit = require('express-rate-limit');

// General API rate limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Chat-specific rate limiter: 10 requests per minute (to control AI API costs)
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many chat requests, please wait a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, chatLimiter };
