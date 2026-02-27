const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const nodemailer = require('nodemailer');

// Configure NodeMailer transporter (using a test/demo service or valid credentials)
// In production, use standard env variables for credentials
const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other mail service
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Buyer/User)
exports.placeOrder = async (req, res) => {
    // Start a MongoDB session for an atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { shippingAddress } = req.body;
        let totalAmount = 0;
        const orderItems = [];

        // Fetch user's cart
        const cart = await Cart.findOne({ user: req.user.id }).session(session);

        if (!cart || cart.items.length === 0) {
            throw new Error('Your cart is empty');
        }

        // Iterate through the cart items
        for (let item of cart.items) {
            // Find the product within the active transaction session
            // This locks the document or ensures consistent reads during the transaction
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }

            // Check if enough stock is available
            if (product.stockQuantity < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            // Decrement the stock quantity atomically
            product.stockQuantity -= item.quantity;

            // Save the updated product back to the database within the session
            await product.save({ session });

            // Calculate the item total based on the current price
            const itemPrice = product.price;
            totalAmount += itemPrice * item.quantity;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: itemPrice
            });
        }

        // Create the order instance
        const order = new Order({
            buyer: req.user.id,
            products: orderItems,
            totalAmount,
            shippingAddress
        });

        // Save the order to the database within the session
        await order.save({ session });

        // Clear the user's cart within the session
        cart.items = [];
        await cart.save({ session });

        // Commit the transaction - saving all changes (stock deductions + order creation) atomically
        await session.commitTransaction();
        session.endSession();

        // The rest is asynchronous and doesn't affect the exactness of the transaction
        res.status(201).json({ message: 'Order placed successfully', order });

        // Async Email Notification
        try {
            const buyer = await User.findById(req.user.id);
            if (buyer && buyer.email) {
                const mailOptions = {
                    from: process.env.EMAIL_USER || 'no-reply@campuskart.com',
                    to: buyer.email,
                    subject: 'CampusKart - Order Confirmation',
                    text: `Hello ${buyer.name},\n\nYour order (ID: ${order._id}) for $${totalAmount} has been successfully placed.\n\nThank you for shopping on CampusKart!`
                };
                await transporter.sendMail(mailOptions);
                console.log(`Order confirmation email sent to ${buyer.email}`);
            }
        } catch (emailError) {
            // Log email errors but do not fail the overall order request since the transaction was successful
            console.error('Failed to send order confirmation email:', emailError.message);
        }

    } catch (error) {
        // If ANY error occurs (e.g., inadequate stock, missing product), abort the transaction
        // This reverses all previous stock deductions in this session, averting race condition inconsistencies.
        await session.abortTransaction();
        session.endSession();

        // Return a bad request with the exact cause
        res.status(400).json({ message: 'Order failed', error: error.message });
    }
};
