export default function MetricCard({ label, value, change, color }) {
    return (
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <div className="text-textMuted text-sm font-medium mb-1">{label}</div>
            <div className="text-3xl font-bold text-textMain">{value}</div>
            <div className={`${color} text-sm mt-2 font-medium`}>↑ {change} from last month</div>
        </div>
    );
}
