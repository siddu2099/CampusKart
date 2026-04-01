const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stockQuantity, imageURL } = req.body;

        // Create a new product instance, capturing the sellerId from the authenticated user token
        const product = new Product({
            name,
            description,
            price,
            category,
            stockQuantity,
            imageURL,
            sellerId: req.user.id
        });

        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure the seller owns this product or is an admin
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Update the product, returning the new version after update
        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure the seller owns this product or is an admin
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all products (with filtering, pagination & search)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        // Pagination setup
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filtering and Search setup
        let query = {};

        // Search by product name (case-insensitive regex)
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by price range (e.g., minPrice & maxPrice)
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        // Execute query with pagination
        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .populate('sellerId', 'name email') // Optionally populate seller fields
            .sort({ createdAt: -1 }); // Sort by newest first

        // Get total count for pagination metadata
        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get products for logged in seller
// @route   GET /api/products/seller/me
// @access  Private (Seller)
exports.getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get product recommendations using weighted scoring
// @route   GET /api/products/recommendations?category=X&price=Y
// @access  Public
//
// Scoring formula:
//   categoryScore  → 0.6 weight (exact category match = full score)
//   priceScore     → 0.4 weight (proximity within ±30% price range)
//   totalScore     = (categoryMatch * 0.6) + (priceProximity * 0.4)
//
exports.getRecommendations = async (req, res) => {
    try {
        const { category, price } = req.query;

        if (!category && !price) {
            return res.status(400).json({ message: 'Provide at least category or price as a query param' });
        }

        const referencePrice = price ? Number(price) : null;

        // Build a broad fetch: get all products in the category OR within price range
        const orConditions = [];

        if (category) {
            orConditions.push({ category });
        }

        if (referencePrice) {
            orConditions.push({
                price: {
                    $gte: referencePrice * 0.7,  // -30%
                    $lte: referencePrice * 1.3   // +30%
                }
            });
        }

        const candidates = await Product.find({ $or: orConditions }).limit(50);

        // Score each candidate
        const scored = candidates.map((product) => {
            let score = 0;

            // Category signal — weight 0.6
            if (category && product.category === category) {
                score += 0.6;
            }

            // Price proximity signal — weight 0.4
            // Score is proportional to how close the product price is to the reference
            if (referencePrice && referencePrice > 0) {
                const priceDiff = Math.abs(product.price - referencePrice) / referencePrice;
                // priceDiff = 0 → full score; priceDiff = 0.3 → score = 0
                const priceProximity = Math.max(0, 1 - priceDiff / 0.3);
                score += priceProximity * 0.4;
            }

            return { product, score };
        });

        // Sort by score descending, return top 5
        const top5 = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(({ product, score }) => ({
                ...product.toObject(),
                recommendationScore: parseFloat(score.toFixed(2))
            }));

        res.json({ success: true, count: top5.length, data: top5 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

