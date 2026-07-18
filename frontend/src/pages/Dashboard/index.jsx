import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CostChart from '../../components/charts/CostChart';
import api from '../../api/axios';

const PROVIDER_COLORS = {
    AWS: 'var(--color-aws)',
    Azure: 'var(--color-azure)',
    GCP: 'var(--color-gcp)',
};

export default function Dashboard() {
    const [summary, setSummary] = useState({ totalSpend: 0, aws: 0, azure: 0, gcp: 0, changes: {} });
    const [providerData, setProviderData] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [summaryRes, providerRes, serviceRes] = await Promise.all([
                    api.get('/costs/summary'),
                    api.get('/costs/by-provider'),
                    api.get('/costs/by-service'),
                ]);
                setSummary(summaryRes.data);
                setProviderData(providerRes.data);
                setTopServices(serviceRes.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const formatCurrency = (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const ChangeIndicator = ({ value }) => {
        if (value === undefined || value === 0) return <span className="text-textMuted text-sm font-medium flex items-center gap-1"><Minus size={14} /> 0%</span>;
        const isPositive = value > 0;
        return (
            <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{value}% from last month
            </span>
        );
    };

    if (loading) {
        return <div className="p-8 text-textMuted">Loading your cloud costs...</div>;
    }

    const totalServiceCost = topServices.reduce((sum, s) => sum + s.cost, 0);

    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Spend (This Month)', value: summary.totalSpend, change: summary.changes?.total, colorClass: 'text-primary', borderClass: 'border-primary/20' },
                    { label: 'AWS', value: summary.aws, change: summary.changes?.aws, colorClass: 'text-aws', borderClass: 'border-aws/20' },
                    { label: 'Azure', value: summary.azure, change: summary.changes?.azure, colorClass: 'text-azure', borderClass: 'border-azure/20' },
                    { label: 'GCP', value: summary.gcp, change: summary.changes?.gcp, colorClass: 'text-gcp', borderClass: 'border-gcp/20' },
                ].map((card) => (
                    <div key={card.label} className={`bg-surface border border-borderMain p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 border-l-4 ${card.borderClass}`}>
                        <div className="text-textMuted text-sm font-medium mb-1">{card.label}</div>
                        <div className={`text-3xl font-bold ${card.colorClass}`}>{formatCurrency(card.value)}</div>
                        <div className="mt-2">
                            <ChangeIndicator value={card.change} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row: 6-Month Trend + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CostChart />
                </div>

                {/* Provider Distribution Donut */}
                <div className="bg-surface border border-borderMain p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold text-textMain mb-2">Provider Distribution</h3>
                    <p className="text-xs text-textMuted mb-4">Current month spend breakdown</p>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={providerData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="cost"
                                    nameKey="provider"
                                    stroke="none"
                                >
                                    {providerData.map((entry) => (
                                        <Cell key={entry.provider} fill={PROVIDER_COLORS[entry.provider] || '#94A3B8'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border-main)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="space-y-2 mt-2">
                        {providerData.map((entry) => {
                            const total = providerData.reduce((s, e) => s + e.cost, 0);
                            const pct = total > 0 ? ((entry.cost / total) * 100).toFixed(1) : 0;
                            return (
                                <div key={entry.provider} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[entry.provider] }} />
                                        <span className="text-textMain font-medium">{entry.provider}</span>
                                    </div>
                                    <span className="text-textMuted">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top 5 Costliest Services */}
            <div className="bg-surface border border-borderMain rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 pb-3">
                    <h3 className="text-lg font-semibold text-textMain">Top 5 Costliest Services</h3>
                    <p className="text-xs text-textMuted mt-1">Across all providers, all time</p>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-t border-b border-borderMain bg-surfaceHover/50">
                            <th className="text-left p-4 font-semibold text-textMuted text-xs uppercase tracking-wider">Service</th>
                            <th className="text-right p-4 font-semibold text-textMuted text-xs uppercase tracking-wider">Total Cost</th>
                            <th className="text-right p-4 font-semibold text-textMuted text-xs uppercase tracking-wider w-48">Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topServices.map((item, i) => {
                            const pct = totalServiceCost > 0 ? ((item.cost / totalServiceCost) * 100).toFixed(1) : 0;
                            return (
                                <tr key={item.service} className="border-b border-borderLight last:border-0 hover:bg-surfaceHover/50 transition-colors">
                                    <td className="p-4 text-textMain font-medium flex items-center gap-3">
                                        <span className="text-xs font-bold text-textMuted bg-surfaceHover w-6 h-6 rounded-lg flex items-center justify-center">{i + 1}</span>
                                        {item.service}
                                    </td>
                                    <td className="p-4 text-right text-textMain font-semibold">{formatCurrency(item.cost)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-textMuted text-xs">{pct}%</span>
                                            <div className="w-24 h-2 bg-borderMain rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
