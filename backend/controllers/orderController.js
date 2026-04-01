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
        const { shippingAddress, products: directProducts } = req.body;
        let totalAmount = 0;
        const orderItems = [];
        let itemsToProcess = [];
        let cart = null;

        // If directProducts is provided (Direct Buy), use it. Otherwise, use Cart.
        if (directProducts && directProducts.length > 0) {
            itemsToProcess = directProducts;
        } else {
            // Fetch user's cart
            cart = await Cart.findOne({ user: req.user.id }).session(session);
            if (!cart || cart.items.length === 0) {
                throw new Error('Your cart is empty');
            }
            itemsToProcess = cart.items;
        }

        // Iterate through the items to process (either direct or from cart)
        for (let item of itemsToProcess) {
            // Atomically deduct stock only if sufficient quantity exists.
            // The condition { stockQuantity: { $gte: item.quantity } } acts as a guard —
            // if stock is insufficient, findOneAndUpdate returns null and we abort.
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stockQuantity: { $gte: item.quantity } },
                { $inc: { stockQuantity: -item.quantity } },
                { session, new: true }
            );

            if (!updatedProduct) {
                // Either product not found or insufficient stock — abort entire transaction
                throw new Error(`Insufficient stock or product not found for ID: ${item.product}`);
            }

            const itemPrice = updatedProduct.price;
            totalAmount += itemPrice * item.quantity;

            orderItems.push({
                product: updatedProduct._id,
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

        // Clear the user's cart within the session ONLY if we used the cart
        if (cart) {
            cart.items = [];
            await cart.save({ session });
        }

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
