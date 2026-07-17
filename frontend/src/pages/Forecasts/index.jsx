import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ComposedChart, Area } from 'recharts';
import { AlertTriangle, TrendingUp, Activity, Zap } from 'lucide-react';
import api from '../../api/axios';

export default function Forecasts() {
    const [chartData, setChartData] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [anomalyLoading, setAnomalyLoading] = useState(true);
    const [anomalyError, setAnomalyError] = useState(null);

    // Fetch forecast data from Express API
    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const response = await api.get('/costs/trend?months=6');

                // Group by month (same logic as CostChart)
                const grouped = {};
                response.data.forEach(item => {
                    if (!grouped[item.month]) grouped[item.month] = 0;
                    grouped[item.month] += item.total;
                });

                const historical = Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, total]) => ({ month, total: Math.round(total) }));

                // Simple forecast: average of last 3 months + 5% growth each month
                const lastThree = historical.slice(-3);
                const avgSpend = lastThree.reduce((sum, d) => sum + d.total, 0) / lastThree.length;

                const lastMonth = new Date(historical[historical.length - 1]?.month + '-01');
                const forecast = [];
                for (let i = 1; i <= 3; i++) {
                    const futureDate = new Date(lastMonth);
                    futureDate.setMonth(futureDate.getMonth() + i);
                    const monthStr = futureDate.toISOString().slice(0, 7);
                    forecast.push({
                        month: monthStr,
                        forecast: Math.round(avgSpend * (1 + 0.05 * i)),
                    });
                }

                setChartData([...historical, ...forecast]);
            } catch (error) {
                console.error("Failed to fetch forecast", error);
            }
        };
        fetchForecast();
    }, []);

    // Fetch anomalies from ML service
    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                setAnomalyLoading(true);
                const res = await fetch('http://localhost:5001/api/ml/anomalies');
                const data = await res.json();
                if (data.error) {
                    setAnomalyError(data.error);
                } else {
                    setAnomalies(data);
                }
            } catch (err) {
                setAnomalyError('ML service unavailable. Make sure it is running on port 5001.');
            } finally {
                setAnomalyLoading(false);
            }
        };
        fetchAnomalies();
    }, []);

    // Severity classification
    const getSeverity = (cost) => {
        if (cost >= 1500) return { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' };
        if (cost >= 800) return { label: 'High', color: 'text-amber-600 bg-amber-50 border-amber-200' };
        return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Stats
    const totalAnomalyCost = anomalies.reduce((sum, a) => sum + a.cost, 0);
    const maxAnomaly = anomalies.length > 0 ? Math.max(...anomalies.map(a => a.cost)) : 0;
    const criticalCount = anomalies.filter(a => a.cost >= 1500).length;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h2 className="text-xl font-bold text-textMain">Forecasts & Anomaly Detection</h2>
                <p className="text-sm text-textMuted mt-1">Projected spend and ML-powered cost spike detection using Isolation Forest</p>
            </div>

            {/* ─── Forecast Chart ─── */}
            <div className="bg-surface border border-borderMain p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-primary" />
                    <h3 className="font-semibold text-textMain">Cost Forecast</h3>
                    <span className="text-xs text-textMuted ml-auto">Next 3 months projected</span>
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'total' ? 'Actual' : 'Forecast']}
                            />

                            {/* Gradient fill under actual line */}
                            <Area type="monotone" dataKey="total" fill="url(#actualGradient)" stroke="none" />

                            {/* Historical line */}
                            <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-primary)' }} name="Actual" />

                            {/* Forecast line (dashed) */}
                            <Line type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="8 4" dot={{ r: 4, fill: '#8B5CF6' }} name="Forecast" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-primary"></div>
                        <span className="text-sm text-textMuted">Historical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 border-t-2 border-dashed border-purple-500"></div>
                        <span className="text-sm text-textMuted">Forecast</span>
                    </div>
                </div>
            </div>

            {/* ─── Anomaly Detection Section ─── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-red-500" />
                    <h3 className="text-lg font-semibold text-textMain">Anomaly Detection</h3>
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-medium ml-2">
                        Isolation Forest ML
                    </span>
                </div>

                {/* Stats Cards */}
                {!anomalyLoading && !anomalyError && anomalies.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface border border-borderMain p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                                <AlertTriangle size={14} />
                                Anomalies Detected
                            </div>
                            <p className="text-2xl font-bold text-textMain">{anomalies.length}</p>
                        </div>
                        <div className="bg-surface border border-borderMain p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                                <Zap size={14} />
                                Total Anomalous Spend
                            </div>
                            <p className="text-2xl font-bold text-red-600">${totalAnomalyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-surface border border-borderMain p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                                <AlertTriangle size={14} className="text-red-500" />
                                Critical Spikes
                            </div>
                            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                        </div>
                    </div>
                )}

                {/* Anomaly Table */}
                <div className="bg-surface border border-borderMain rounded-2xl shadow-sm overflow-hidden">
                    {anomalyLoading ? (
                        <div className="p-8 text-center text-textMuted text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                Running Isolation Forest analysis...
                            </div>
                        </div>
                    ) : anomalyError ? (
                        <div className="p-8 text-center text-red-500 text-sm">
                            <AlertTriangle size={20} className="mx-auto mb-2" />
                            {anomalyError}
                        </div>
                    ) : anomalies.length === 0 ? (
                        <div className="p-8 text-center text-green-600 text-sm">
                            No anomalies detected. Your spending patterns look normal.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-borderMain bg-surfaceHover">
                                    <th className="text-left text-xs font-medium text-textMuted px-6 py-3">Date</th>
                                    <th className="text-left text-xs font-medium text-textMuted px-6 py-3">Anomalous Cost</th>
                                    <th className="text-left text-xs font-medium text-textMuted px-6 py-3">Severity</th>
                                    <th className="text-left text-xs font-medium text-textMuted px-6 py-3">Deviation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {anomalies.map((anomaly, i) => {
                                    const severity = getSeverity(anomaly.cost);
                                    const avgCost = totalAnomalyCost / anomalies.length;
                                    const deviation = ((anomaly.cost - avgCost) / avgCost * 100).toFixed(0);
                                    return (
                                        <tr key={i} className="border-b border-borderLight last:border-0 hover:bg-surfaceHover transition-colors">
                                            <td className="px-6 py-4 text-sm text-textMain font-medium">{formatDate(anomaly.date)}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-red-600">${anomaly.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${severity.color}`}>
                                                    {severity.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-textMuted">
                                                {deviation > 0 ? '+' : ''}{deviation}% from mean
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
