const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    aqi_value: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['threshold_exceeded', 'daily_summary', 'hazardous_level'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sent_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
