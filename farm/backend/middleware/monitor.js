// middleware/monitor.js
const logger = require('../config/logger');

const monitor = (req, res, next) => {
    const start = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userIP: req.ip,
            userAgent: req.get('user-agent')
        };

        if (res.statusCode >= 400) {
            logger.error('Request failed', log);
        } else {
            logger.info('Request completed', log);
        }
    });

    next();
};

module.exports = monitor;