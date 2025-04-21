// routes/marketRoutes.js
const express = require('express');
const router = express.Router();
const MarketPrice = require('../../models/MarketPrice');
const MarketAnalytics = require('../../models/MarketAnalytics');

// Add new market price
router.post('/prices', async (req, res) => {
    try {
        const price = new MarketPrice(req.body);
        await price.save();
        res.status(201).json(price);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get market prices with filters
router.get('/prices', async (req, res) => {
    try {
        const { 
            cropName, 
            market, 
            state, 
            startDate, 
            endDate,
            priceType,
            quality
        } = req.query;

        let query = {};

        if (cropName) query.cropName = cropName;
        if (market) query.market = market;
        if (state) query.state = state;
        if (priceType) query.priceType = priceType;
        if (quality) query.quality = quality;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const prices = await MarketPrice.find(query)
            .sort({ date: -1 })
            .limit(100);

        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get price trends
router.get('/trends/:cropName', async (req, res) => {
    try {
        const { timeFrame = 'daily' } = req.query;
        
        const analytics = await MarketAnalytics.findOne({
            cropName: req.params.cropName,
            timeFrame: timeFrame
        });

        if (!analytics) {
            // Calculate analytics if not exists
            const prices = await MarketPrice.find({
                cropName: req.params.cropName
            }).sort({ date: -1 });

            if (prices.length === 0) {
                return res.status(404).json({ message: 'No price data available' });
            }

            const priceValues = prices.map(p => p.price);
            const analytics = new MarketAnalytics({
                cropName: req.params.cropName,
                market: prices[0].market,
                timeFrame: timeFrame,
                analytics: {
                    averagePrice: priceValues.reduce((a, b) => a + b) / priceValues.length,
                    minPrice: Math.min(...priceValues),
                    maxPrice: Math.max(...priceValues),
                    priceChange: ((prices[0].price - prices[prices.length-1].price) / prices[prices.length-1].price) * 100,
                    trend: prices[0].price > prices[prices.length-1].price ? 'up' : 'down'
                }
            });

            await analytics.save();
            res.json(analytics);
        } else {
            res.json(analytics);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get price comparison between markets
router.get('/comparison', async (req, res) => {
    try {
        const { cropName, markets } = req.query;
        
        if (!cropName || !markets) {
            return res.status(400).json({ message: 'Crop name and markets are required' });
        }

        const marketList = markets.split(',');
        const comparison = await MarketPrice.aggregate([
            {
                $match: {
                    cropName: cropName,
                    market: { $in: marketList },
                    date: { $gte: new Date(Date.now() - 7*24*60*60*1000) } // Last 7 days
                }
            },
            {
                $group: {
                    _id: '$market',
                    averagePrice: { $avg: '$price' },
                    currentPrice: { $first: '$price' }
                }
            }
        ]);

        res.json(comparison);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get price statistics
router.get('/statistics', async (req, res) => {
    try {
        const { cropName, market, timeFrame = 'monthly' } = req.query;

        let dateFilter = {};
        switch(timeFrame) {
            case 'weekly':
                dateFilter = { $gte: new Date(Date.now() - 7*24*60*60*1000) };
                break;
            case 'monthly':
                dateFilter = { $gte: new Date(Date.now() - 30*24*60*60*1000) };
                break;
            case 'yearly':
                dateFilter = { $gte: new Date(Date.now() - 365*24*60*60*1000) };
                break;
        }

        const stats = await MarketPrice.aggregate([
            {
                $match: {
                    cropName: cropName,
                    market: market,
                    date: dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    averagePrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalRecords: { $sum: 1 }
                }
            }
        ]);

        res.json(stats[0] || { message: 'No data available' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;