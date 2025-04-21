// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Chat = require('../../models/Chat');

// Create new chat
router.post('/', async (req, res) => {
    try {
        const { participants, chatType } = req.body;
        const chat = new Chat({
            participants,
            chatType,
            messages: []
        });
        await chat.save();
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's chats
router.get('/user/:userId', async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.params.userId
        }).sort({ lastMessage: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get chat messages
router.get('/:chatId/messages', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json(chat.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark messages as read
router.patch('/:chatId/read', async (req, res) => {
    try {
        const { userId } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        chat.messages.forEach(msg => {
            if (msg.sender !== userId && !msg.read) {
                msg.read = true;
            }
        });

        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;