// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: String,
        required: true
    }],
    messages: [{
        sender: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    chatType: {
        type: String,
        enum: ['direct', 'expert', 'support'],
        required: true
    },
    lastMessage: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);