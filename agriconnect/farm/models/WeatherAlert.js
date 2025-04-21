// models/WeatherAlert.js
const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    location: {
        city: String,
        state: String,
        country: String
    },
    alertType: {
        type: String,
        enum: ['rain', 'temperature', 'humidity', 'storm', 'frost'],
        required: true
    },
    threshold: {
        min: Number,
        max: Number
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema);