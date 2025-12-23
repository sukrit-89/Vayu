const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityAction',
        required: true,
        index: true
    },
    completed_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a user can only complete an action once
userActionSchema.index({ user_id: 1, action_id: 1 }, { unique: true });

module.exports = mongoose.model('UserAction', userActionSchema);
