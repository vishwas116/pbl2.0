// routes/cropRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const CropDisease = require('../../models/cropDisease');

// Create storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/crops/');
    },
    filename: function(req, file, cb) {
        cb(null, 'crop-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with storage configuration
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Route for crop disease detection
router.post('/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const cropDisease = new CropDisease({
            imageUrl: `/uploads/crops/${req.file.filename}`,
            diagnosis: 'Sample diagnosis - This would be replaced with AI detection'
        });

        await cropDisease.save();
        res.status(201).json(cropDisease);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get all crop disease records
router.get('/', async (req, res) => {
    try {
        const records = await CropDisease.find().sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;