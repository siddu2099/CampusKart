const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Prevent Admin registration
        if (role === 'Admin') {
            return res.status(403).json({ message: 'Admin registration is not allowed' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing — never save plain text secrets
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Remove any existing OTP for this email before creating a new one
        await Otp.deleteMany({ email });

        const otpEntry = new Otp({ email, otp: hashedOtp });
        await otpEntry.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this based on your provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'CampusKart Registration OTP',
            text: `Your OTP for CampusKart registration is: ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully to email' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyRegistration = async (req, res) => {
    try {
        const { name, email, password, role, otp } = req.body;

        // Find the OTP entry by email only (we compare hash separately)
        const otpEntry = await Otp.findOne({ email });
        if (!otpEntry) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Block if too many failed attempts (brute-force protection)
        if (otpEntry.attempts >= 5) {
            await Otp.deleteOne({ _id: otpEntry._id });
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Compare submitted OTP against stored bcrypt hash
        const isMatch = await bcrypt.compare(otp, otpEntry.otp);
        if (!isMatch) {
            // Increment failure counter
            otpEntry.attempts += 1;
            await otpEntry.save();
            const remaining = 5 - otpEntry.attempts;
            return res.status(400).json({ message: `Invalid OTP. ${remaining} attempt(s) remaining.` });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Buyer'
        });

        await user.save();

        // Delete the OTP so it cannot be reused
        await Otp.deleteOne({ _id: otpEntry._id });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
