import { Bell, User } from 'lucide-react';

export default function Header({ title = 'Overview' }) {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-8">
      
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-textMain tracking-tight">{title}</h2>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-surfaceHover transition-colors">
          <Bell size={18} />
          {/* Notification Dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-textMain leading-tight">Ananya</p>
            <p className="text-[11px] text-textMuted leading-tight">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
