import { useState, useEffect } from 'react';
import MetricCard from '../../components/ui/MetricCard';
import CostChart from '../../components/charts/CostChart';
import api from '../../api/axios';

export default function Dashboard() {
    const [summary, setSummary] = useState({
        totalSpend: 0,
        aws: 0,
        azure: 0,
        gcp: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/costs/summary');
                setSummary(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch cost summary", error);
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    // Format numbers nicely as currency
    const formatCurrency = (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (loading) {
        return <div className="p-8 text-textMuted">Loading your cloud costs...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Total Spend (This Month)" value={formatCurrency(summary.totalSpend)} change="+8.2%" color="text-primary" />
                <MetricCard label="AWS" value={formatCurrency(summary.aws)} change="+12%" color="text-aws" />
                <MetricCard label="Azure" value={formatCurrency(summary.azure)} change="+5.1%" color="text-azure" />
                <MetricCard label="GCP" value={formatCurrency(summary.gcp)} change="+3.4%" color="text-gcp" />
            </div>
            <CostChart />
        </div>
    );
}
