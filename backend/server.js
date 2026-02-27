const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Update this with your Vercel frontend URL once deployed
    credentials: true,
}));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => res.send('CampusKart API Running'));

const PORT = process.env.PORT || 5000;

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@campuskart.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (!existingAdmin) {
            console.log('Seeding default Admin account...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'Admin'
            });
            await admin.save();
            console.log('Admin account seeded successfully!');
        }
    } catch (err) {
        console.error('Error seeding admin account:', err);
    }
};

app.listen(PORT, async () => {
    await seedAdmin();
    console.log(`Server running on port ${PORT}`);
});
