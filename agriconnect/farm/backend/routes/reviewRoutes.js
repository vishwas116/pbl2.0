// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');
const Product = require('../../models/Product');

// Add a review
router.post('/', async (req, res) => {
    try {
        const { userId, productId, rating, comment, userName } = req.body;

        // Create new review
        const review = new Review({
            userId,
            productId,
            rating,
            comment,
            userName
        });

        await review.save();

        // Update product's average rating
        const reviews = await Review.find({ productId });
        const avgRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            $set: { rating: avgRating.toFixed(1) }
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews by a user
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;