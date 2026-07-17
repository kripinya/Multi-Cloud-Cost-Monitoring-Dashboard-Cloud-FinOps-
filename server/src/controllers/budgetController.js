const Budget = require('../models/Budget');
const CostRecord = require('../models/CostRecord');
const Alert = require('../models/Alert');

// Helper: Check budget thresholds and create alerts if needed
const checkAndCreateAlerts = async (budget, currentSpend) => {
    const utilization = (currentSpend / budget.amount) * 100;

    for (const threshold of budget.alertThresholds) {
        if (utilization >= threshold) {
            // Check if an alert for this budget + threshold already exists
            const existingAlert = await Alert.findOne({
                budgetId: budget._id,
                thresholdCrossed: threshold
            });

            if (!existingAlert) {
                const severity = threshold >= 100 ? 'critical' : 'warning';
                await Alert.create({
                    budgetId: budget._id,
                    thresholdCrossed: threshold,
                    currentSpend: currentSpend,
                    severity: severity
                });
                console.log(`Alert created: Budget "${budget.name}" crossed ${threshold}% (${severity})`);
            }
        }
    }
};

// GET /api/budgets — list all budgets with their current spend
const getAllBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find();

        // For each budget, calculate the current month's spend for that provider
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const budgetsWithSpend = await Promise.all(budgets.map(async (budget) => {
            const filter = { date: { $gte: startOfMonth } };
            if (budget.provider !== 'all') {
                filter.provider = budget.provider;
            }

            const result = await CostRecord.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$cost' } } }
            ]);

            const currentSpend = result.length > 0 ? Math.round(result[0].total * 100) / 100 : 0;

            // Check thresholds and create alerts automatically
            await checkAndCreateAlerts(budget, currentSpend);

            return {
                ...budget.toObject(),
                currentSpend,
                utilization: Math.round((currentSpend / budget.amount) * 100)
            };
        }));

        res.json(budgetsWithSpend);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
};

// POST /api/budgets — create a new budget
const createBudget = async (req, res) => {
    try {
        const { name, provider, amount, period, alertThresholds } = req.body;

        const budget = new Budget({ name, provider, amount, period, alertThresholds });
        await budget.save();

        res.status(201).json(budget);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create budget' });
    }
};

// PUT /api/budgets/:id — update an existing budget
const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }     // return the updated document, not the old one
        );

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json(budget);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update budget' });
    }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndDelete(req.params.id);

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        // Also delete associated alerts when a budget is removed
        await Alert.deleteMany({ budgetId: req.params.id });

        res.json({ success: true, message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete budget' });
    }
};

module.exports = { getAllBudgets, createBudget, updateBudget, deleteBudget };
