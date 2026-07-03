export default function MetricCard({ label, value, change, color }) {
    return (
        <div className="bg-surface border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="text-textMuted text-sm font-medium mb-1">{label}</div>
            <div className="text-3xl font-bold text-textMain">{value}</div>
            <div className={`${color} text-sm mt-2 font-medium`}>↑ {change} from last month</div>
        </div>
    );
}
