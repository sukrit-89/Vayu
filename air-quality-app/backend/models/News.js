const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    source_url: {
        type: String,
        required: true,
        unique: true
    },
    source_name: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        default: null
    },
    published_at: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for sorting by published date
newsSchema.index({ published_at: -1 });

module.exports = mongoose.model('News', newsSchema);
