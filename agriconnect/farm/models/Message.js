// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    attachments: [String],
    messageType: {
        type: String,
        enum: ['text', 'image', 'document'],
        default: 'text'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);