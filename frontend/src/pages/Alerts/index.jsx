import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alerts').then(res => {
            setAlerts(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-textMuted">Loading alerts...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-textMain">Alerts</h2>

            {alerts.length === 0 ? (
                <div className="bg-surface border border-borderMain rounded-2xl p-10 text-center">
                    <CheckCircle size={32} className="mx-auto text-emerald-400 mb-3" />
                    <p className="text-textMuted">No alerts have been triggered yet. Create a budget and alerts will appear here when thresholds are crossed.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => {
                        const isCritical = alert.severity === 'critical';
                        const budgetName = alert.budgetId?.name || 'Deleted Budget';
                        const provider = alert.budgetId?.provider || '';
                        const budgetAmount = alert.budgetId?.amount;

                        return (
                            <div 
                                key={alert._id} 
                                className={`flex items-center gap-4 p-4 rounded-2xl border bg-surface ${
                                    isCritical 
                                        ? 'border-red-200 dark:border-red-500/30' 
                                        : 'border-amber-200 dark:border-amber-500/30'
                                } ${alert.isRead ? 'opacity-60' : ''}`}
                            >
                                <div className={`p-2 rounded-xl ${isCritical ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                                    {isCritical 
                                        ? <ShieldAlert size={20} className="text-red-500" />
                                        : <AlertTriangle size={20} className="text-amber-500" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-textMain text-sm">
                                        {budgetName} crossed {alert.thresholdCrossed}% threshold
                                    </p>
                                    <p className="text-xs text-textMuted mt-0.5">
                                        {provider && `${provider} · `}
                                        Spent ${alert.currentSpend?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        {budgetAmount && ` of ${budgetAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                                        {' · '}
                                        {new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-lg ${
                                    isCritical 
                                        ? 'text-red-600 bg-red-50 dark:bg-red-500/10' 
                                        : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'
                                }`}>
                                    {alert.severity}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
