import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function CostExplorer() {
    const [costs, setCosts] = useState([]);
    const [provider, setProvider] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                const query = provider !== 'all' ? `?provider=${provider}` : '';
                const response = await api.get(`/costs/by-service${query}`);
                setCosts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch costs", error);
                setLoading(false);
            }
        };
        fetchCosts();
    }, [provider]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-textMain">Cost Explorer</h2>

                {/* Provider Filter */}
                <div className="flex gap-2">
                    {['all', 'AWS', 'Azure', 'GCP'].map((p) => (
                        <button
                            key={p}
                            onClick={() => { setProvider(p); setLoading(true); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                                ${provider === p
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface text-textMuted border-borderMain hover:border-primary hover:text-primary'
                                }`}
                        >
                            {p === 'all' ? 'All Providers' : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cost Table */}
            <div className="bg-surface border border-borderMain rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-borderMain bg-surfaceHover/50">
                            <th className="text-left p-4 font-semibold text-textMain">Service</th>
                            <th className="text-right p-4 font-semibold text-textMain">Total Cost</th>
                            <th className="text-right p-4 font-semibold text-textMain">% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="p-8 text-center text-textMuted">Loading...</td></tr>
                        ) : costs.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-textMuted">No cost data found.</td></tr>
                        ) : (
                            costs.map((item, index) => {
                                const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);
                                const percentage = ((item.cost / totalCost) * 100).toFixed(1);
                                return (
                                    <tr key={index} className="border-b border-borderLight hover:bg-surfaceHover/50 transition-colors">
                                        <td className="p-4 text-textMain font-medium">{item.service}</td>
                                        <td className="p-4 text-right text-textMain">${item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right">
                                            <span className="text-textMuted">{percentage}%</span>
                                            <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 ml-auto">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
