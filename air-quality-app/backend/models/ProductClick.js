const mongoose = require('mongoose');

const productClickSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    product_id: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    product_url: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['mask', 'purifier', 'supplement', 'plant', 'monitor', 'other'],
        required: true
    },
    clicked_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductClick', productClickSchema);
