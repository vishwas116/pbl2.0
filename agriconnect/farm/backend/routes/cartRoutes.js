// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');

// Get cart items
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            return res.json({ items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add item to cart
router.post('/add', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItem = cart.items.find(item => 
            item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove item from cart
router.delete('/remove/:userId/:productId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => 
            item.productId.toString() !== req.params.productId
        );

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;