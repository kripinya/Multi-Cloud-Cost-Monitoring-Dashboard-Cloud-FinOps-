const express = require('express');
const router = express.Router();

// Import the controller (the actual logic)
const costController = require('../controllers/costController');

// Define routes
// Remember: these are all relative to /api/costs (set in index.js)
// So "GET /summary" actually means "GET /api/costs/summary"

router.get('/summary', costController.getSummary);
router.get('/daily', costController.getDailyCosts);
router.get('/by-service', costController.getCostsByService);
router.get('/by-provider', costController.getCostsByProvider);
router.get('/by-region', costController.getCostsByRegion);
router.get('/trend', costController.getTrend);

module.exports = router;
