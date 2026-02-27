const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true // Indexed for text search performance
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        index: true // Indexed for filtering by price
    },
    category: {
        type: String,
        required: true,
        index: true // Indexed for category filtering
    },
    stockQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    imageURL: {
        type: String
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true,
        index: true
    }
}, { timestamps: true });

// Compound index for category and price
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
