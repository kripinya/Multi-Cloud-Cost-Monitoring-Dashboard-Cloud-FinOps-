import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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

    const statusConfig = {
        triggered: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
        active: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
        resolved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    };

    if (loading) return <div className="text-textMuted">Loading alerts...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-textMain">Alerts</h2>

            {alerts.length === 0 ? (
                <p className="text-textMuted">No alerts configured yet.</p>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => {
                        const config = statusConfig[alert.status] || statusConfig.active;
                        const Icon = config.icon;

                        return (
                            <div key={alert._id} className={`flex items-center gap-4 p-4 rounded-2xl border ${config.bg} ${config.border}`}>
                                <div className={`p-2 rounded-xl ${config.bg}`}>
                                    <Icon size={20} className={config.color} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-textMain text-sm">{alert.name}</p>
                                    <p className="text-xs text-textMuted mt-0.5">
                                        {alert.provider} · Threshold: ${alert.threshold?.toLocaleString()} · {alert.condition}
                                    </p>
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                                    {alert.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
