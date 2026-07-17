import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, X, Trash2 } from 'lucide-react';

export default function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ name: '', provider: 'AWS', amount: '', period: 'monthly' });
    const [submitting, setSubmitting] = useState(false);

    const fetchBudgets = () => {
        api.get('/budgets').then(res => {
            setBudgets(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/budgets', {
                ...formData,
                amount: Number(formData.amount)
            });
            setShowModal(false);
            setFormData({ name: '', provider: 'AWS', amount: '', period: 'monthly' });
            fetchBudgets(); // Refresh list
        } catch (error) {
            console.error("Failed to create budget", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this budget?")) return;
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets(); // Refresh list after deletion
        } catch (error) {
            console.error("Failed to delete budget", error);
        }
    };

    const getProgressColor = (spent, limit) => {
        const ratio = spent / limit;
        if (ratio >= 0.9) return 'bg-red-500';
        if (ratio >= 0.7) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    if (loading) return <div className="text-textMuted">Loading budgets...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-textMain">Budgets</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                >
                    <Plus size={18} />
                    Create Budget
                </button>
            </div>

            {budgets.length === 0 ? (
                <p className="text-textMuted">No budgets set up yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const spent = budget.currentSpend || 0;
                        const limit = budget.amount; // Fixed: was budget.limit
                        const ratio = Math.min((spent / limit) * 100, 100);

                        return (
                            <div key={budget._id} className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm relative group">
                                <button 
                                    onClick={() => handleDelete(budget._id)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Budget"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="flex items-center justify-between mb-1 pr-6">
                                    <h3 className="font-semibold text-textMain">{budget.name}</h3>
                                    <span className="text-xs font-medium text-textMuted uppercase tracking-wider">{budget.provider}</span>
                                </div>
                                <p className="text-xs text-textMuted mb-4">{budget.period} budget</p>

                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-2xl font-bold text-textMain">${spent.toLocaleString()}</span>
                                    <span className="text-sm text-textMuted">/ ${limit.toLocaleString()}</span>
                                </div>

                                <div className="w-full h-2 bg-slate-200 rounded-full">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(spent, limit)}`}
                                        style={{ width: `${ratio}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-textMuted mt-2">{ratio.toFixed(0)}% used</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Budget Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Create New Budget</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Budget Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. Q3 AWS Production"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                                    <select 
                                        value={formData.provider}
                                        onChange={(e) => setFormData({...formData, provider: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                                    >
                                        <option value="AWS">AWS</option>
                                        <option value="Azure">Azure</option>
                                        <option value="GCP">GCP</option>
                                        <option value="all">All Providers</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
