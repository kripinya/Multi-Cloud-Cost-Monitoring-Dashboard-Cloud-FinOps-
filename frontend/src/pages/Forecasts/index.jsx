import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../../api/axios';

export default function Forecasts() {
    const [data, setData] = useState([]);

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

                setData([...historical, ...forecast]);
            } catch (error) {
                console.error("Failed to fetch forecast", error);
            }
        };
        fetchForecast();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-textMain">Cost Forecasts</h2>
                <p className="text-sm text-textMuted mt-1">Projected spend for the next 3 months based on historical trends</p>
            </div>

            <div className="bg-surface border border-slate-200 p-6 rounded-2xl shadow-sm h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />

                        {/* Historical line */}
                        <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-primary)' }} name="Actual" />

                        {/* Forecast line (dashed) */}
                        <Line type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="8 4" dot={{ r: 4, fill: '#8B5CF6' }} name="Forecast" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-6">
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
    );
}
