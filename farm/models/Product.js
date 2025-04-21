// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['seeds', 'fertilizers', 'tools', 'machinery', 'pesticides', 'other']
    },
    image: String,
    seller: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    tags: [String],
    specifications: {
        weight: String,
        dimensions: String,
        manufacturer: String,
        brand: String
    },
    createdAt: { type: Date, default: Date.now }
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);