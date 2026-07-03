import MetricCard from '../../components/ui/MetricCard';
import CostChart from '../../components/charts/CostChart';
export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Total Spend" value="$24,567.89" change="+8.2%" color="text-primary" />
                <MetricCard label="AWS" value="$10,234.56" change="+12%" color="text-aws" />
                <MetricCard label="Azure" value="$7,890.12" change="+5.1%" color="text-azure" />
                <MetricCard label="GCP" value="$6,443.21" change="+3.4%" color="text-gcp" />
            </div>
            <CostChart />
        </div>

    );
}
