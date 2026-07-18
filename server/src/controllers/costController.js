const CostRecord = require('../models/CostRecord');

// GET /api/costs/summary
// Returns: total spend + per-provider spend for the current month
const getSummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Current month totals
        const providerTotals = await CostRecord.aggregate([
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: '$provider', total: { $sum: '$cost' } } }
        ]);

        // Previous month totals for % change calculation
        const prevTotals = await CostRecord.aggregate([
            { $match: { date: { $gte: startOfLastMonth, $lt: startOfMonth } } },
            { $group: { _id: '$provider', total: { $sum: '$cost' } } }
        ]);

        const prevMap = {};
        prevTotals.forEach(item => { prevMap[item._id.toLowerCase()] = Math.round(item.total * 100) / 100; });

        const summary = { totalSpend: 0, aws: 0, azure: 0, gcp: 0, changes: {} };

        providerTotals.forEach(item => {
            const key = item._id.toLowerCase();
            const amount = Math.round(item.total * 100) / 100;
            summary[key] = amount;
            summary.totalSpend += amount;
            const prev = prevMap[key] || 0;
            summary.changes[key] = prev > 0 ? Math.round(((amount - prev) / prev) * 1000) / 10 : 0;
        });
        summary.totalSpend = Math.round(summary.totalSpend * 100) / 100;
        const prevTotal = Object.values(prevMap).reduce((s, v) => s + v, 0);
        summary.changes.total = prevTotal > 0 ? Math.round(((summary.totalSpend - prevTotal) / prevTotal) * 1000) / 10 : 0;

        res.json(summary);
    } catch (error) {
        console.error('Error in getSummary:', error);
        res.status(500).json({ error: 'Failed to fetch cost summary' });
    }
};

// GET /api/costs/daily?provider=AWS&from=2026-01-01&to=2026-06-25
// Returns: array of { date, cost } for the line chart
const getDailyCosts = async (req, res) => {
    try {
        const { provider, from, to } = req.query;

        // Build the filter object dynamically
        const filter = {};
        if (provider && provider !== 'all') {
            filter.provider = provider;
        }
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        // Aggregate: group by date, sum all costs for that day
        const dailyCosts = await CostRecord.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    cost: { $sum: '$cost' }
                }
            },
            { $sort: { _id: 1 } },  // sort by date ascending
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    cost: { $round: ['$cost', 2] }
                }
            }
        ]);

        res.json(dailyCosts);
    } catch (error) {
        console.error('Error in getDailyCosts:', error);
        res.status(500).json({ error: 'Failed to fetch daily costs' });
    }
};

// GET /api/costs/by-service?provider=AWS
// Returns: array of { service, cost } for the donut chart
const getCostsByService = async (req, res) => {
    try {
        const { provider } = req.query;
        const filter = {};
        if (provider && provider !== 'all') {
            filter.provider = provider;
        }

        const serviceCosts = await CostRecord.aggregate([
            { $match: filter },
            { $group: { _id: '$service', cost: { $sum: '$cost' } } },
            { $sort: { cost: -1 } },  // most expensive first
            { $project: { _id: 0, service: '$_id', cost: { $round: ['$cost', 2] } } }
        ]);

        res.json(serviceCosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch costs by service' });
    }
};

// GET /api/costs/by-provider
// Returns: array of { provider, cost } for the bar chart
const getCostsByProvider = async (req, res) => {
    try {
        const providerCosts = await CostRecord.aggregate([
            { $group: { _id: '$provider', cost: { $sum: '$cost' } } },
            { $sort: { cost: -1 } },
            { $project: { _id: 0, provider: '$_id', cost: { $round: ['$cost', 2] } } }
        ]);

        res.json(providerCosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch costs by provider' });
    }
};

// GET /api/costs/by-region?provider=AWS
// Returns: array of { region, cost } for the region bar chart
const getCostsByRegion = async (req, res) => {
    try {
        const { provider } = req.query;
        const filter = {};
        if (provider && provider !== 'all') {
            filter.provider = provider;
        }

        const regionCosts = await CostRecord.aggregate([
            { $match: filter },
            { $group: { _id: '$region', cost: { $sum: '$cost' } } },
            { $sort: { cost: -1 } },
            { $project: { _id: 0, region: '$_id', cost: { $round: ['$cost', 2] } } }
        ]);

        res.json(regionCosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch costs by region' });
    }
};

// GET /api/costs/trend?months=6
// Returns: array of { month, provider, total } for the trend chart
const getTrend = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const trend = await CostRecord.aggregate([
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: '%Y-%m', date: '$date' } },
                        provider: '$provider'
                    },
                    total: { $sum: '$cost' }
                }
            },
            { $sort: { '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    provider: '$_id.provider',
                    total: { $round: ['$total', 2] }
                }
            }
        ]);

        res.json(trend);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cost trend' });
    }
};

// GET /api/costs/by-tag?groupBy=project|team|environment&provider=AWS
// Returns: array of { tag, cost } grouped by the specified tag field
const getCostsByTag = async (req, res) => {
    try {
        const { groupBy = 'project', provider } = req.query;
        const validTags = ['project', 'team', 'environment'];
        if (!validTags.includes(groupBy)) {
            return res.status(400).json({ error: `Invalid groupBy. Use: ${validTags.join(', ')}` });
        }

        const filter = {};
        if (provider && provider !== 'all') filter.provider = provider;

        const tagCosts = await CostRecord.aggregate([
            { $match: filter },
            { $group: { _id: `$tags.${groupBy}`, cost: { $sum: '$cost' } } },
            { $sort: { cost: -1 } },
            { $project: { _id: 0, tag: '$_id', cost: { $round: ['$cost', 2] } } }
        ]);

        res.json(tagCosts);
    } catch (error) {
        console.error('Error in getCostsByTag:', error);
        res.status(500).json({ error: 'Failed to fetch costs by tag' });
    }
};

// Export all functions
module.exports = {
    getSummary,
    getDailyCosts,
    getCostsByService,
    getCostsByProvider,
    getCostsByRegion,
    getTrend,
    getCostsByTag
};
