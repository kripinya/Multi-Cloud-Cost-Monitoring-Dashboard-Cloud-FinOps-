const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// GET /api/alerts — list all alerts, newest first, with budget details
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

// GET /api/alerts/unread — get only unread alerts (for notification bell)
router.get('/unread', async (req, res) => {
    try {
        const alerts = await Alert.find({ isRead: false })
            .populate('budgetId', 'name provider amount')
            .sort({ timestamp: -1 })
            .limit(20);

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread alerts' });
    }
});

// PUT /api/alerts/:id/read — mark a single alert as read
router.put('/:id/read', async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json(alert);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark alert as read' });
    }
});

// PUT /api/alerts/read-all — mark all alerts as read
router.put('/read-all', async (req, res) => {
    try {
        await Alert.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All alerts marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark alerts as read' });
    }
});

module.exports = router;
