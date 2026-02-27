const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Total Users
        // Count total documents in the User collection
        const totalUsers = await User.countDocuments();

        // 2. Total Orders
        // Count total documents in the Order collection
        const totalOrders = await Order.countDocuments();

        // 3. Total Revenue
        // Using aggregation to sum up the 'totalAmount' field of all Order documents
        const revenueAggregation = await Order.aggregate([
            // Stage 1: Group all documents together (using _id: null)
            // Stage 2: Sum the totalAmount field into a new field called 'totalRevenue'
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Extract the totalRevenue value from the aggregation result array, defaulting to 0
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // 4. Top-Selling Products
        // Using aggregation to unwind the products array and sum quantities
        const topProductsAggregation = await Order.aggregate([
            // Stage 1: Deconstruct the 'products' array to output a document for each element
            // This flattens the array so we can process each product individually
            { $unwind: '$products' },

            // Stage 2: Group by the nested product ID and calculate total quantity sold
            {
                $group: {
                    _id: '$products.product', // Group by product ID
                    totalSold: { $sum: '$products.quantity' } // Sum up all quantities sold
                }
            },

            // Stage 3: Sort the grouped results in descending order based on 'totalSold'
            { $sort: { totalSold: -1 } },

            // Stage 4: Limit the output to the top 5 best-selling products
            { $limit: 5 },

            // Stage 5: Lookup (Join) with the Product collection to get details (name, price)
            {
                $lookup: {
                    from: 'products', // Name of the target collection
                    localField: '_id', // Field from the input documents (product ID)
                    foreignField: '_id', // Field from the target collection (product ID)
                    as: 'productDetails' // Field to insert the joined array
                }
            },

            // Stage 6: Unwind the resulting array from the lookup to flatten the product details
            { $unwind: '$productDetails' },

            // Stage 7: Project (select) the exact fields we want in our final response
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    name: '$productDetails.name',
                    category: '$productDetails.category',
                    price: '$productDetails.price'
                }
            }
        ]);

        // Send the compiled analytics response
        res.json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalRevenue,
                topSellingProducts: topProductsAggregation
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
