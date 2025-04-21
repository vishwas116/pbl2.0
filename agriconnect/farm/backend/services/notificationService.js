// services/notificationService.js
const Notification = require('../models/Notification');

const notificationService = {
    // Create order notification
    async orderNotification(userId, orderId, status) {
        try {
            const notification = new Notification({
                userId,
                title: 'Order Update',
                message: `Your order #${orderId} is ${status}`,
                type: 'order'
            });
            await notification.save();
        } catch (error) {
            console.error('Error creating order notification:', error);
        }
    },

    // Create product notification
    async productNotification(userId, productName, action) {
        try {
            const notification = new Notification({
                userId,
                title: 'Product Update',
                message: `Product ${productName} has been ${action}`,
                type: 'product'
            });
            await notification.save();
        } catch (error) {
            console.error('Error creating product notification:', error);
        }
    },

    // Create crop disease detection notification
    async cropNotification(userId, result) {
        try {
            const notification = new Notification({
                userId,
                title: 'Crop Disease Detection',
                message: `New disease detection result: ${result}`,
                type: 'crop'
            });
            await notification.save();
        } catch (error) {
            console.error('Error creating crop notification:', error);
        }
    }
};

module.exports = notificationService;