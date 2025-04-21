const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');
const auth = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
    try {
        // Get user's role
        const user = await User.findById(req.user._id);
        
        // Different summaries based on user role
        if (user.role === 'farmer') {
            // Farmer Dashboard
            const summary = {
                // Products
                products: await Product.countDocuments({ seller: req.user._id }),
                
                // Orders
                totalOrders: await Order.countDocuments({ seller: req.user._id }),
                pendingOrders: await Order.countDocuments({ 
                    seller: req.user._id, 
                    status: 'pending' 
                }),
                
                // Revenue
                revenue: await Order.aggregate([
                    { $match: { seller: req.user._id, status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]),
                
                // Recent Orders
                recentOrders: await Order.find({ seller: req.user._id })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('buyer', 'name'),
                
                // Top Products
                topProducts: await Order.aggregate([
                    { $match: { seller: req.user._id } },
                    { $unwind: '$items' },
                    { $group: { 
                        _id: '$items.product',
                        totalSold: { $sum: '$items.quantity' }
                    }},
                    { $sort: { totalSold: -1 } },
                    { $limit: 5 }
                ])
            };
            res.json(summary);
        } else {
            // Customer Dashboard
            const summary = {
                // Orders
                totalOrders: await Order.countDocuments({ buyer: req.user._id }),
                pendingOrders: await Order.countDocuments({ 
                    buyer: req.user._id, 
                    status: 'pending' 
                }),
                
                // Recent Orders
                recentOrders: await Order.find({ buyer: req.user._id })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('seller', 'name'),
                
                // Total Spent
                totalSpent: await Order.aggregate([
                    { $match: { buyer: req.user._id, status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ])
            };
            res.json(summary);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;