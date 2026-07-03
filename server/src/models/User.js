const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,         // no two users can have the same email
        lowercase: true
    },
    password: {
        type: String,
        required: true        // this will store the HASHED password, never plain text
    },
    role: {
        type: String,
        enum: ['admin', 'viewer'],
        default: 'admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
