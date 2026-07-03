import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/budgets').then(res => {
            setBudgets(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const getProgressColor = (spent, limit) => {
        const ratio = spent / limit;
        if (ratio >= 0.9) return 'bg-red-500';
        if (ratio >= 0.7) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    if (loading) return <div className="text-textMuted">Loading budgets...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-textMain">Budgets</h2>

            {budgets.length === 0 ? (
                <p className="text-textMuted">No budgets set up yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const spent = budget.currentSpend || 0;
                        const ratio = Math.min((spent / budget.limit) * 100, 100);

                        return (
                            <div key={budget._id} className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-textMain">{budget.name}</h3>
                                    <span className="text-xs font-medium text-textMuted uppercase tracking-wider">{budget.provider}</span>
                                </div>
                                <p className="text-xs text-textMuted mb-4">{budget.period} budget</p>

                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-2xl font-bold text-textMain">${spent.toLocaleString()}</span>
                                    <span className="text-sm text-textMuted">/ ${budget.limit.toLocaleString()}</span>
                                </div>

                                <div className="w-full h-2 bg-slate-200 rounded-full">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(spent, budget.limit)}`}
                                        style={{ width: `${ratio}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-textMuted mt-2">{ratio.toFixed(0)}% used</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
