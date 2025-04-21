// routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const cache = require('../middleware/cache');

// Get weather data (cached for 30 minutes)
router.get('/:city', cache(1800), async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${req.params.city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});