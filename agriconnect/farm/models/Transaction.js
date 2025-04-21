// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cod'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paymentGatewayResponse: Object
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);