const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    budgetId: {
        type: mongoose.Schema.Types.ObjectId,   // this "points to" a Budget document
        ref: 'Budget',                           // tells Mongoose which collection
        required: true
    },
    thresholdCrossed: {
        type: Number,             // which percentage was hit, e.g., 90
        required: true
    },
    currentSpend: {
        type: Number,             // how much was spent when the alert fired
        required: true
    },
    severity: {
        type: String,
        enum: ['warning', 'critical'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
