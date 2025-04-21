// models/ForumPost.js
const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['crop_issues', 'market_prices', 'techniques', 'equipment', 'weather', 'general'],
        required: true
    },
    images: [String],
    likes: [String], // Array of userIds who liked
    comments: [{
        userId: String,
        userName: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    tags: [String],
    isExpertAdvice: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);