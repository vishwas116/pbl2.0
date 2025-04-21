// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

// Get all orders
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create order
router.post('/', auth, async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            buyer: req.user._id
        });
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status
router.patch('/:orderId', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );
        
        // Send order status update email
        await emailService.sendOrderStatusUpdate(order.userEmail, order);
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;