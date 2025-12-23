const mongoose = require('mongoose');

const communityActionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    action_type: {
        type: String,
        enum: ['petition', 'retweet', 'report', 'donation', 'volunteer', 'awareness'],
        required: true
    },
    action_url: {
        type: String,
        required: true
    },
    completed_count: {
        type: Number,
        default: 0,
        min: 0
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CommunityAction', communityActionSchema);
