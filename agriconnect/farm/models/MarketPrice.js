// models/MarketPrice.js
const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    cropName: { type: String, required: true },
    market: { type: String, required: true },
    state: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    date: { type: Date, default: Date.now },
    priceType: {
        type: String,
        enum: ['wholesale', 'retail'],
        required: true
    },
    quality: {
        type: String,
        enum: ['premium', 'standard', 'basic'],
        default: 'standard'
    }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);