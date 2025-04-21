const mongoose = require('mongoose');

const cropScheduleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        enum: ['planting', 'fertilizing', 'irrigation', 'pesticide', 'harvesting', 'other'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'missed'],
        default: 'pending'
    },
    reminder: {
        enabled: {
            type: Boolean,
            default: true
        },
        daysBeforeEvent: {
            type: Number,
            default: 1
        }
    },
    area: {
        size: Number,
        unit: {
            type: String,
            enum: ['acres', 'hectares', 'square-meters'],
            default: 'acres'
        }
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CropSchedule', cropScheduleSchema);