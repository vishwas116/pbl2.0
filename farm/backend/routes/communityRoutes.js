// routes/communityRoutes.js
const express = require('express');
const router = express.Router();
const ForumPost = require('../../models/ForumPost');
const Expert = require('../../models/Expert');
const multer = require('multer');
const path = require('path');

// Configure multer for forum post images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/forum/');
    },
    filename: function(req, file, cb) {
        cb(null, 'forum-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create forum post
router.post('/posts', upload.array('images', 5), async (req, res) => {
    try {
        const post = new ForumPost({
            ...req.body,
            images: req.files ? req.files.map(file => `/uploads/forum/${file.filename}`) : []
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get forum posts with filters and pagination
router.get('/posts', async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const posts = await ForumPost.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await ForumPost.countDocuments(query);

        res.json({
            posts,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add comment to post
router.post('/posts/:postId/comments', async (req, res) => {
    try {
        const post = await ForumPost.findByIdAndUpdate(
            req.params.postId,
            { $push: { comments: req.body } },
            { new: true }
        );
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like/unlike post
router.post('/posts/:postId/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await ForumPost.findById(req.params.postId);
        
        const index = post.likes.indexOf(userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }
        
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register expert
router.post('/experts', async (req, res) => {
    try {
        const expert = new Expert(req.body);
        await expert.save();
        res.status(201).json(expert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get expert list
router.get('/experts', async (req, res) => {
    try {
        const { specialization } = req.query;
        let query = {};
        
        if (specialization) {
            query.specialization = specialization;
        }

        const experts = await Expert.find(query).sort({ rating: -1 });
        res.json(experts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;