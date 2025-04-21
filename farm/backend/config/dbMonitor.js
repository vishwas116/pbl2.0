// config/dbMonitor.js
const mongoose = require('mongoose');
const logger = require('./logger');

const monitorDB = () => {
    // Monitor database connection
    mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });

    // Monitor database operations
    mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`MongoDB ${collectionName}.${method}`, {
            query,
            doc
        });
    });
};

module.exports = monitorDB;