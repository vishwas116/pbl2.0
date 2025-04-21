// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../../models/Message');
const SupportTicket = require('../../models/SupportTicket');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/support/');
    },
    filename: function(req, file, cb) {
        cb(null, 'support-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Send message
router.post('/messages', upload.array('attachments', 5), async (req, res) => {
    try {
        const message = new Message({
            ...req.body,
            attachments: req.files ? req.files.map(file => `/uploads/support/${file.filename}`) : []
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get conversation messages
router.get('/messages/:userId/:receiverId', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.params.userId, receiverId: req.params.receiverId },
                { senderId: req.params.receiverId, receiverId: req.params.userId }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create support ticket
router.post('/tickets', async (req, res) => {
    try {
        const ticket = new SupportTicket(req.body);
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's tickets
router.get('/tickets/:userId', async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update ticket status
router.patch('/tickets/:ticketId', async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.ticketId,
            { 
                ...req.body,
                updatedAt: Date.now()
            },
            { new: true }
        );
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark messages as read
router.patch('/messages/read', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        await Message.updateMany(
            { senderId, receiverId, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;