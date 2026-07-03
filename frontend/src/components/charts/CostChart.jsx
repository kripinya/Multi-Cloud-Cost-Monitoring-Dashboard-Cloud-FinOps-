import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fake data for now (we'll fetch real data from your backend later)
const data = [
    { name: 'Jan', AWS: 4000, Azure: 2400, GCP: 2400 },
    { name: 'Feb', AWS: 3000, Azure: 1398, GCP: 2210 },
    { name: 'Mar', AWS: 2000, Azure: 9800, GCP: 2290 },
    { name: 'Apr', AWS: 2780, Azure: 3908, GCP: 2000 },
    { name: 'May', AWS: 1890, Azure: 4800, GCP: 2181 },
    { name: 'Jun', AWS: 2390, Azure: 3800, GCP: 2500 },
];

export default function CostChart() {
    return (
        <div className="bg-surface border border-slate-200 p-6 rounded-2xl shadow-sm h-[400px]">
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
                    />

                    {/* Using the CSS variables we defined in index.css! */}
                    <Bar dataKey="AWS" fill="var(--color-aws)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Azure" fill="var(--color-azure)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="GCP" fill="var(--color-gcp)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
