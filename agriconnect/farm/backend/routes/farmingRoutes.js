// routes/farmingRoutes.js
const express = require('express');
const router = express.Router();
const WeatherAlert = require('../models/WeatherAlert');
const CropCalendar = require('../models/CropCalendar');
const axios = require('axios');

// Weather API key (you should move this to .env file)
const WEATHER_API_KEY = '32a5c8a020a45d95499e11c453d5d1a3';

// Create weather alert
router.post('/weather-alerts', async (req, res) => {
    try {
        const alert = new WeatherAlert(req.body);
        await alert.save();
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's weather alerts
router.get('/weather-alerts/:userId', async (req, res) => {
    try {
        const alerts = await WeatherAlert.find({ 
            userId: req.params.userId,
            isActive: true 
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get weather forecast
router.get('/weather/:city', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${req.params.city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create crop calendar entry
router.post('/crop-calendar', async (req, res) => {
    try {
        const calendar = new CropCalendar(req.body);
        await calendar.save();
        res.status(201).json(calendar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's crop calendar
router.get('/crop-calendar/:userId', async (req, res) => {
    try {
        const calendar = await CropCalendar.find({ userId: req.params.userId })
            .sort({ 'activities.startDate': 1 });
        res.json(calendar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update activity status
router.patch('/crop-calendar/:calendarId/activity/:activityId', async (req, res) => {
    try {
        const { status } = req.body;
        const calendar = await CropCalendar.findOneAndUpdate(
            { 
                '_id': req.params.calendarId,
                'activities._id': req.params.activityId 
            },
            { 
                $set: { 'activities.$.status': status } 
            },
            { new: true }
        );
        res.json(calendar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;