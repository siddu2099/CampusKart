const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true // Fast lookup by email during verification
    },
    otp: {
        type: String,
        required: true,
        // Stored as bcrypt hash — never plain text
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5 // Block after 5 failed verification attempts
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // TTL index — auto-deleted after 5 minutes
    },
});

module.exports = mongoose.model('Otp', otpSchema);
