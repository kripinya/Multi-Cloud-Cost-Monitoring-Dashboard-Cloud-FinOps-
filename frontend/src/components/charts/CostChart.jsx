import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

export default function CostChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchTrend = async () => {
            try {
                const response = await api.get('/costs/trend?months=6');

                // The backend returns a flat list of { month, provider, total }
                // Recharts needs it grouped by month: { name: '2026-01', AWS: 400, Azure: 200... }

                const formattedData = {};
                response.data.forEach(item => {
                    if (!formattedData[item.month]) {
                        formattedData[item.month] = { name: item.month, AWS: 0, Azure: 0, GCP: 0 };
                    }
                    formattedData[item.month][item.provider] = item.total;
                });

                // Convert object to array and sort by date string
                const chartData = Object.values(formattedData).sort((a, b) => a.name.localeCompare(b.name));

                setData(chartData);
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            }
        };

        fetchTrend();
    }, []);

    return (
        <div className="bg-surface border border-borderMain p-6 rounded-2xl shadow-sm h-[400px]">
            <h3 className="text-lg font-semibold text-textMain mb-6">6-Month Cost Trend</h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 12 }}
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />

                    <Tooltip
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value}`, undefined]}
                    />

                    <Bar dataKey="AWS" fill="var(--color-aws)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Azure" fill="var(--color-azure)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="GCP" fill="var(--color-gcp)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
