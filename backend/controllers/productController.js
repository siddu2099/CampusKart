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
