// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered'],
        default: 'pending'
    },
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);