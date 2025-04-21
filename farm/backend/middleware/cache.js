// middleware/cache.js
const redis = require('../config/redisConfig');
const logger = require('../config/logger');

const cache = (duration) => {
    return async (req, res, next) => {
        try {
            const key = `cache:${req.originalUrl}`;
            
            // Check if key exists in Redis
            const cachedData = await redis.get(key);
            
            if (cachedData) {
                logger.info(`Cache hit for ${key}`);
                return res.json(JSON.parse(cachedData));
            }

            // If not in cache, continue with request and cache response
            const originalSend = res.json;
            res.json = async function(data) {
                try {
                    await redis.setex(key, duration, JSON.stringify(data));
                    logger.info(`Cached ${key} for ${duration} seconds`);
                } catch (error) {
                    logger.error('Redis caching error:', error);
                }
                return originalSend.call(this, data);
            };
            
            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

module.exports = cache;