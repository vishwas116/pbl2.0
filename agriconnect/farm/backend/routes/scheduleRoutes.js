const express = require('express');
const router = express.Router();
const CropSchedule = require('../../models/CropSchedule');
const auth = require('../middleware/auth');

// Get all schedules for a user
router.get('/', auth, async (req, res) => {
    try {
        const schedules = await CropSchedule.find({ user: req.user._id })
            .sort({ startDate: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new schedule
router.post('/', auth, async (req, res) => {
    try {
        const schedule = new CropSchedule({
            ...req.body,
            user: req.user._id
        });
        const newSchedule = await schedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get upcoming activities
router.get('/upcoming', auth, async (req, res) => {
    try {
        const upcoming = await CropSchedule.find({
            user: req.user._id,
            startDate: { $gte: new Date() },
            status: { $ne: 'completed' }
        })
        .sort({ startDate: 1 })
        .limit(10);
        res.json(upcoming);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update schedule
router.patch('/:id', auth, async (req, res) => {
    try {
        const schedule = await CropSchedule.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete schedule
router.delete('/:id', auth, async (req, res) => {
    try {
        const schedule = await CropSchedule.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark schedule as completed
router.patch('/:id/complete', auth, async (req, res) => {
    try {
        const schedule = await CropSchedule.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { 
                status: 'completed',
                completed: true 
            },
            { new: true }
        );
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get calendar view (monthly)
router.get('/calendar/:year/:month', auth, async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1; // JavaScript months are 0-based
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const schedules = await CropSchedule.find({
            user: req.user._id,
            $or: [
                { startDate: { $gte: startDate, $lte: endDate } },
                { endDate: { $gte: startDate, $lte: endDate } }
            ]
        }).sort({ startDate: 1 });

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;