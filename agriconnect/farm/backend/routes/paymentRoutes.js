// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');
const Order = require('../../models/Order');

// Initialize payment
router.post('/initialize', async (req, res) => {
    try {
        const { orderId, amount, paymentMethod } = req.body;

        // Create transaction record
        const transaction = new Transaction({
            userId: req.body.userId,
            orderId,
            amount,
            paymentMethod,
            status: 'pending'
        });

        await transaction.save();

        // Simulate payment gateway integration
        const paymentDetails = {
            transactionId: 'TXN' + Date.now(),
            amount: amount,
            currency: 'INR',
            redirectUrl: `/api/payment/verify/${transaction._id}`
        };

        res.json({
            success: true,
            transaction: transaction._id,
            paymentDetails
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify payment
router.post('/verify/:transactionId', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Simulate payment verification
        const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate

        if (isPaymentSuccessful) {
            transaction.status = 'completed';
            transaction.paymentDetails = {
                transactionId: 'TXN' + Date.now(),
                paymentGatewayResponse: {
                    status: 'SUCCESS',
                    message: 'Payment processed successfully'
                }
            };

            // Update order status
            await Order.findByIdAndUpdate(transaction.orderId, {
                status: 'confirmed',
                paymentStatus: 'paid'
            });
        } else {
            transaction.status = 'failed';
            transaction.paymentDetails = {
                paymentGatewayResponse: {
                    status: 'FAILED',
                    message: 'Payment processing failed'
                }
            };
        }

        await transaction.save();
        res.json({ success: isPaymentSuccessful, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get transaction history
router.get('/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get transaction details
router.get('/transaction/:transactionId', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId)
            .populate('orderId');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Request refund
router.post('/refund', async (req, res) => {
    try {
        const { transactionId, reason } = req.body;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'completed') {
            return res.status(400).json({ message: 'Cannot refund this transaction' });
        }

        // Simulate refund process
        transaction.status = 'refunded';
        transaction.paymentDetails.refundDetails = {
            refundId: 'REF' + Date.now(),
            reason: reason,
            refundDate: new Date()
        };

        await transaction.save();

        // Update order status
        await Order.findByIdAndUpdate(transaction.orderId, {
            status: 'refunded'
        });

        res.json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;