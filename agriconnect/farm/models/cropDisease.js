// models/CropDisease.js
const mongoose = require('mongoose');

const cropDiseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    symptoms: [{
        type: String
    }],
    treatments: [{
        type: String
    }],
    preventiveMeasures: [{
        type: String
    }],
    affectedCrops: [{
        type: String
    }],
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    }
});

module.exports = mongoose.model('CropDisease', cropDiseaseSchema);