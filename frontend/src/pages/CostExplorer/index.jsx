import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Filter, Tag, Calendar } from 'lucide-react';
import api from '../../api/axios';

const PROVIDER_COLORS = ['var(--color-aws)', 'var(--color-azure)', 'var(--color-gcp)', 'var(--color-primary)', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'];

export default function CostExplorer() {
    const [costs, setCosts] = useState([]);
    const [provider, setProvider] = useState('all');
    const [loading, setLoading] = useState(true);
    const [tagData, setTagData] = useState([]);
    const [tagGroup, setTagGroup] = useState('project');
    const [tagLoading, setTagLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Fetch service costs
    const fetchCosts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (provider !== 'all') params.append('provider', provider);
            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await api.get(`/costs/by-service${query}`);
            setCosts(response.data);
        } catch (error) {
            console.error("Failed to fetch costs", error);
        } finally {
            setLoading(false);
        }
    }, [provider]);

    // Fetch tag-based costs
    const fetchTagData = useCallback(async () => {
        try {
            setTagLoading(true);
            const params = new URLSearchParams({ groupBy: tagGroup });
            if (provider !== 'all') params.append('provider', provider);
            const response = await api.get(`/costs/by-tag?${params.toString()}`);
            setTagData(response.data);
        } catch (error) {
            console.error("Failed to fetch tag costs", error);
        } finally {
            setTagLoading(false);
        }
    }, [tagGroup, provider]);

    useEffect(() => { fetchCosts(); }, [fetchCosts]);
    useEffect(() => { fetchTagData(); }, [fetchTagData]);

    // CSV Export
    const exportCSV = () => {
        if (costs.length === 0) return;
        const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);
        const header = 'Service,Total Cost (USD),% of Total\n';
        const rows = costs.map(item => {
            const pct = ((item.cost / totalCost) * 100).toFixed(1);
            return `${item.service},${item.cost.toFixed(2)},${pct}%`;
        }).join('\n');
        const footer = `\nTotal,${totalCost.toFixed(2)},100%`;
        const csv = header + rows + footer;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cost-report-${provider}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);
    const totalTagCost = tagData.reduce((sum, t) => sum + t.cost, 0);

    return (
        <div className="space-y-6">
            {/* Header Row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-textMain">Cost Explorer</h2>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Date Range Filters */}
                    <div className="flex items-center gap-2 bg-surface border border-borderMain rounded-xl px-3 py-1.5">
                        <Calendar size={14} className="text-textMuted" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="bg-transparent text-sm text-textMain outline-none w-32"
                            placeholder="From"
                        />
                        <span className="text-textMuted text-xs">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="bg-transparent text-sm text-textMain outline-none w-32"
                            placeholder="To"
                        />
                    </div>

                    {/* Provider Filter */}
                    <div className="flex gap-2">
                        {['all', 'AWS', 'Azure', 'GCP'].map((p) => (
                            <button
                                key={p}
                                onClick={() => { setProvider(p); }}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                                    ${provider === p
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface text-textMuted border-borderMain hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {p === 'all' ? 'All' : p}
                            </button>
                        ))}
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportCSV}
                        disabled={costs.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Service Cost Bar Chart */}
            <div className="bg-surface border border-borderMain rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={16} className="text-primary" />
                    <h3 className="font-semibold text-textMain">Cost by Service</h3>
                    <span className="text-xs text-textMuted ml-auto">{provider === 'all' ? 'All Providers' : provider}</span>
                </div>
                {loading ? (
                    <div className="h-[280px] flex items-center justify-center text-textMuted text-sm">Loading chart...</div>
                ) : (
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costs.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-main)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="service" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border-main)' }}
                                    formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Cost']}
                                />
                                <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={20}>
                                    {costs.slice(0, 10).map((_, i) => (
                                        <Cell key={i} fill={PROVIDER_COLORS[i % PROVIDER_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Service Cost Table */}
            <div className="bg-surface border border-borderMain rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-borderMain bg-surfaceHover/50">
                            <th className="text-left p-4 font-semibold text-textMuted text-xs uppercase tracking-wider">Service</th>
                            <th className="text-right p-4 font-semibold text-textMuted text-xs uppercase tracking-wider">Total Cost</th>
                            <th className="text-right p-4 font-semibold text-textMuted text-xs uppercase tracking-wider w-48">% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="p-8 text-center text-textMuted">Loading...</td></tr>
                        ) : costs.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-textMuted">No cost data found.</td></tr>
                        ) : (
                            costs.map((item, index) => {
                                const percentage = totalCost > 0 ? ((item.cost / totalCost) * 100).toFixed(1) : 0;
                                return (
                                    <tr key={index} className="border-b border-borderLight hover:bg-surfaceHover/50 transition-colors">
                                        <td className="p-4 text-textMain font-medium">{item.service}</td>
                                        <td className="p-4 text-right text-textMain font-semibold">${item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="text-textMuted text-xs">{percentage}%</span>
                                                <div className="w-24 h-2 bg-borderMain rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    {!loading && costs.length > 0 && (
                        <tfoot>
                            <tr className="bg-surfaceHover/50 border-t border-borderMain">
                                <td className="p-4 font-bold text-textMain">Total</td>
                                <td className="p-4 text-right font-bold text-textMain">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="p-4 text-right font-bold text-textMuted text-xs">100%</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Tag-Based Cost Breakdown */}
            <div className="bg-surface border border-borderMain rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-primary" />
                        <h3 className="font-semibold text-textMain">Cost by Tag</h3>
                    </div>
                    <div className="flex gap-2">
                        {['project', 'team', 'environment'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTagGroup(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize
                                    ${tagGroup === t
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface text-textMuted border-borderMain hover:border-primary'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {tagLoading ? (
                    <div className="py-8 text-center text-textMuted text-sm">Loading tag data...</div>
                ) : (
                    <div className="space-y-3">
                        {tagData.map((item, i) => {
                            const pct = totalTagCost > 0 ? ((item.cost / totalTagCost) * 100).toFixed(1) : 0;
                            return (
                                <div key={item.tag} className="flex items-center gap-4">
                                    <div className="w-28 text-sm text-textMain font-medium capitalize truncate">{item.tag}</div>
                                    <div className="flex-1 h-3 bg-borderMain rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: PROVIDER_COLORS[i % PROVIDER_COLORS.length] }}
                                        />
                                    </div>
                                    <div className="w-24 text-right text-sm text-textMuted">${(item.cost / 1000).toFixed(1)}k</div>
                                    <div className="w-14 text-right text-xs text-textMuted font-medium">{pct}%</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
