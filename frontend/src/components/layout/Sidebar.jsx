import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Wallet, 
  Bell, 
  Bot,
  Settings,
  TrendingUp
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/explorer', icon: Search, label: 'Cost Explorer' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/forecasts', icon: TrendingUp, label: 'Forecasts' },
  { to: '/chat', icon: Bot, label: 'AI Assistant' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface border-r border-slate-200 flex flex-col z-50">
      
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">Vyaya</span>
          <span className="text-textMain">Drishti</span>
        </h1>
        <p className="text-textMuted text-xs mt-1">Multi-Cloud FinOps</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-primary/15 text-primary border border-primary/20' 
                : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
          <p className="text-xs text-primary font-semibold">Free Tier</p>
          <p className="text-[11px] text-textMuted mt-1">3 cloud providers connected</p>
        </div>
      </div>
    </aside>
  );
}
