const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true         // e.g., "AWS Monthly Budget"
    },
    provider: {
        type: String,
        enum: ['AWS', 'Azure', 'GCP', 'all'],
        default: 'all'
    },
    amount: {
        type: Number,
        required: true          // the budget limit, e.g., 10000
    },
    period: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    alertThresholds: {
        type: [Number],         // array of percentages, e.g., [80, 90, 100]
        default: [80, 90, 100]
    },
    currentSpend: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Budget', budgetSchema);
