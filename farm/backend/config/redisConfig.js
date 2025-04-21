const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
    port: 6379,          // Redis port
    host: "127.0.0.1",   // Redis host
    username: "default", // needs Redis >= 6
    password: "",
    db: 0,              // Defaults to 0
});

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
});

module.exports = redis;
