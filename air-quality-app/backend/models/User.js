const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, default: '' }
    },
    health_conditions: [{
        type: String,
        enum: ['asthma', 'copd', 'heart_disease', 'diabetes', 'respiratory_issues', 'allergies', 'none']
    }],
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    },
    expo_push_token: {
        type: String,
        default: null
    },
    aqi_threshold: {
        type: Number,
        default: 200,
        min: 0,
        max: 500
    },
    notification_settings: {
        aqi_alerts: { type: Boolean, default: true },
        daily_summary: { type: Boolean, default: true },
        community_updates: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
