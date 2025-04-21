// models/Expert.js
const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    specialization: {
        type: String,
        enum: ['agronomist', 'soil_scientist', 'plant_pathologist', 'entomologist', 'agricultural_engineer'],
        required: true
    },
    qualification: String,
    experience: Number,
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    availability: {
        available: { type: Boolean, default: true },
        schedule: [{
            day: String,
            hours: String
        }]
    },
    contactInfo: {
        email: String,
        phone: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expert', expertSchema);