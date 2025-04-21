// models/MarketAnalytics.js
const mongoose = require('mongoose');

const marketAnalyticsSchema = new mongoose.Schema({
    cropName: { type: String, required: true },
    market: { type: String, required: true },
    analytics: {
        averagePrice: Number,
        minPrice: Number,
        maxPrice: Number,
        priceChange: Number, // Percentage change
        trend: String // 'up', 'down', or 'stable'
    },
    timeFrame: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketAnalytics', marketAnalyticsSchema);