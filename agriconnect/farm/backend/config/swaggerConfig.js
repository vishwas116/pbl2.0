// config/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FarmConnect API Documentation',
            version: '1.0.0',
            description: 'API documentation for FarmConnect application',
            contact: {
                name: 'API Support',
                email: 'support@farmconnect.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ]
    },
    apis: ['./routes/*.js'] // Path to the API routes
};

const specs = swaggerJsdoc(options);
module.exports = specs;