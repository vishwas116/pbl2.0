const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import configurations and monitoring
const logger = require('./config/logger');
const monitorDB = require('./config/dbMonitor');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimiter');
const auth = require('./middleware/auth');
const monitor = require('./middleware/monitor');

// Import essential routes only
const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Initialize database monitoring
monitorDB();

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(monitor);

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(limiter);

// Regular Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/farmconnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Essential Routes Only
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
    });

    socket.on('send_message', async (data) => {
        io.to(data.chatId).emit('receive_message', {
            sender: data.sender,
            message: data.message,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});