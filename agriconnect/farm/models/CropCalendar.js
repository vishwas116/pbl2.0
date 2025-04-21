// models/CropCalendar.js
const mongoose = require('mongoose');

const cropCalendarSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    cropName: { type: String, required: true },
    activities: [{
        activityType: {
            type: String,
            enum: ['planting', 'irrigation', 'fertilizing', 'pesticide', 'harvesting'],
            required: true
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        },
        notes: String
    }],
    season: {
        type: String,
        enum: ['kharif', 'rabi', 'zaid'],
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CropCalendar', cropCalendarSchema);