const mongoose = require('mongoose');

const aqiDataSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        index: true
    },
    state: {
        type: String,
        required: false,
        default: ''
    },
    station: {
        type: String,
        required: true
    },
    location: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    aqi: {
        type: Number,
        required: true,
        min: 0,
        max: 500
    },
    pollutants: {
        pm25: { type: Number, default: 0 },
        pm10: { type: Number, default: 0 },
        no2: { type: Number, default: 0 },
        so2: { type: Number, default: 0 },
        co: { type: Number, default: 0 },
        o3: { type: Number, default: 0 }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    hour: {
        type: Number,
        min: 0,
        max: 23
    },
    day_of_week: {
        type: Number,
        min: 0,
        max: 6
    },
    month: {
        type: Number,
        min: 1,
        max: 12
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
aqiDataSchema.index({ city: 1, timestamp: -1 });
aqiDataSchema.index({ state: 1, timestamp: -1 });

module.exports = mongoose.model('AQIData', aqiDataSchema);
