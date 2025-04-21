// services/cacheService.js
const redis = require('../config/redisConfig');
const logger = require('../config/logger');

const cacheService = {
    // Set cache with expiry
    async set(key, data, duration) {
        try {
            await redis.setex(`cache:${key}`, duration, JSON.stringify(data));
            logger.info(`Cached ${key} for ${duration} seconds`);
        } catch (error) {
            logger.error('Cache set error:', error);
        }
    },

    // Get cached data
    async get(key) {
        try {
            const data = await redis.get(`cache:${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    },

    // Delete cache
    async delete(key) {
        try {
            await redis.del(`cache:${key}`);
            logger.info(`Cache deleted for ${key}`);
        } catch (error) {
            logger.error('Cache delete error:', error);
        }
    },

    // Clear all cache
    async clear() {
        try {
            await redis.flushall();
            logger.info('Cache cleared');
        } catch (error) {
            logger.error('Cache clear error:', error);
        }
    }
};

module.exports = cacheService;