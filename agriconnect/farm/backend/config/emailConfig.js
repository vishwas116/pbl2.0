const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

// Test the connection
transporter.verify(function(error, success) {
    if (error) {
        console.log('Email config error:', error);
    } else {
        console.log('Email server is ready');
    }
});

module.exports = transporter;