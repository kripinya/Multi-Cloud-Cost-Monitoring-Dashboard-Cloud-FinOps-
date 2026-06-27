const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// GET /api/alerts — list all alerts, newest first
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('budgetId', 'name provider amount')   // pull in budget details
            .sort({ timestamp: -1 })                         // newest first
            .limit(50);

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

module.exports = router;
