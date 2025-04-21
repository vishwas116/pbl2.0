// services/emailService.js
const emailConfig = require(process.cwd() + '/config/emailConfig');
const logger = require(process.cwd() + '/config/logger');

const emailService = {
    // Send order confirmation
    async sendOrderConfirmation(userEmail, orderDetails) {
        try {
            await emailConfig.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Order Confirmation - FarmConnect',
                html: `
                    <h1>Thank you for your order!</h1>
                    <p>Your order #${orderDetails._id} has been confirmed.</p>
                    <h2>Order Details:</h2>
                    <p>Total Amount: ₹${orderDetails.totalAmount}</p>
                    <p>Status: ${orderDetails.status}</p>
                    <p>Date: ${new Date(orderDetails.orderDate).toLocaleDateString()}</p>
                    <hr>
                    <p>Visit our website to track your order.</p>
                `
            });
            logger.info(`Order confirmation email sent to ${userEmail}`);
        } catch (error) {
            logger.error('Error sending order confirmation email:', error);
        }
    },

    // Send welcome email
    async sendWelcomeEmail(userEmail, username) {
        try {
            await emailConfig.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Welcome to FarmConnect!',
                html: `
                    <h1>Welcome to FarmConnect, ${username}!</h1>
                    <p>Thank you for joining our farming community.</p>
                    <p>Here's what you can do with your account:</p>
                    <ul>
                        <li>Buy and sell agricultural products</li>
                        <li>Get crop disease detection</li>
                        <li>Check weather updates</li>
                        <li>Connect with experts</li>
                    </ul>
                    <p>Get started by completing your profile!</p>
                `
            });
            logger.info(`Welcome email sent to ${userEmail}`);
        } catch (error) {
            logger.error('Error sending welcome email:', error);
        }
    },

    // Send order status update
    async sendOrderStatusUpdate(userEmail, orderDetails) {
        try {
            await emailConfig.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `Order Status Update - ${orderDetails.status}`,
                html: `
                    <h1>Order Status Update</h1>
                    <p>Your order #${orderDetails._id} has been ${orderDetails.status}.</p>
                    <p>Current Status: ${orderDetails.status}</p>
                    <p>Updated on: ${new Date().toLocaleDateString()}</p>
                    <hr>
                    <p>Visit our website for more details.</p>
                `
            });
            logger.info(`Order status update email sent to ${userEmail}`);
        } catch (error) {
            logger.error('Error sending order status update email:', error);
        }
    },

    // Send password reset email
    async sendPasswordResetEmail(userEmail, resetToken) {
        try {
            await emailConfig.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>You requested to reset your password.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">
                        Reset Password
                    </a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
            logger.info(`Password reset email sent to ${userEmail}`);
        } catch (error) {
            logger.error('Error sending password reset email:', error);
        }
    },

    // Send crop disease detection result
    async sendDiseaseDetectionResult(userEmail, result) {
        try {
            await emailConfig.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Crop Disease Detection Result',
                html: `
                    <h1>Crop Disease Detection Result</h1>
                    <p>Here are the results of your crop analysis:</p>
                    <h2>Diagnosis: ${result.diagnosis}</h2>
                    <p>Confidence: ${result.confidence}%</p>
                    <h3>Recommendations:</h3>
                    <p>${result.recommendations}</p>
                    <hr>
                    <p>Visit our website for more detailed information and expert advice.</p>
                `
            });
            logger.info(`Disease detection result email sent to ${userEmail}`);
        } catch (error) {
            logger.error('Error sending disease detection result email:', error);
        }
    }
};

module.exports = emailService;