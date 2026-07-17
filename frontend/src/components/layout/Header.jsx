import { useState, useEffect, useRef } from 'react';
import { Bell, User, Sun, Moon, AlertTriangle, CheckCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';

export default function Header({ title = 'Overview' }) {
  const { theme, toggleTheme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread alerts for the notification bell
  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts/unread');
      setAlerts(res.data);
    } catch (error) {
      console.error("Failed to fetch alerts for notifications", error);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Poll every 30 seconds for new alerts
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all alerts as read
  const markAllRead = async () => {
    try {
      await api.put('/alerts/read-all');
      setAlerts([]);
    } catch (error) {
      console.error("Failed to mark alerts as read", error);
    }
  };

  // Format time ago
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <header className="h-16 border-b border-borderMain bg-background flex items-center justify-between px-8 z-10 sticky top-0">
      
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-textMain tracking-tight">{title}</h2>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-surfaceHover transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative p-2 rounded-xl transition-colors ${showDropdown ? 'bg-surfaceHover text-textMain' : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'}`}
          >
            <Bell size={18} />
            {/* Notification Badge - count of unread alerts */}
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-surface border border-borderMain rounded-xl shadow-2xl overflow-hidden z-50">
              {/* Header */}
              <div className="p-3 px-4 border-b border-borderMain flex justify-between items-center bg-background">
                <h3 className="font-semibold text-textMain text-sm">Notifications</h3>
                {alerts.length > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-xs font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>
              
              {/* Alert List */}
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto text-textLight mb-2" />
                    <p className="text-textMuted text-sm">No new notifications</p>
                  </div>
                ) : (
                  alerts.map(alert => {
                    const budgetName = alert.budgetId?.name || 'Unknown Budget';
                    const provider = alert.budgetId?.provider || '';
                    const isCritical = alert.severity === 'critical';

                    return (
                      <div 
                        key={alert._id} 
                        className={`p-3 px-4 border-b border-borderLight last:border-0 hover:bg-surfaceHover transition-colors flex gap-3 ${isCritical ? 'border-l-2 border-l-red-500' : 'border-l-2 border-l-amber-400'}`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                          <AlertTriangle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-textMain leading-tight">
                            {budgetName} crossed {alert.thresholdCrossed}%
                          </p>
                          <p className="text-xs text-textMuted mt-0.5">
                            {provider && `${provider} · `}Spent ${alert.currentSpend?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            {alert.budgetId?.amount && ` of ${alert.budgetId.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                          </p>
                          <p className="text-[10px] text-textLight mt-1">{timeAgo(alert.timestamp)}</p>
                        </div>
                        <span className={`self-start text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isCritical ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'}`}>
                          {alert.severity}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Footer */}
              <div className="p-2 border-t border-borderMain bg-background text-center">
                <a href="/alerts" className="text-xs font-medium text-primary hover:text-secondary transition-colors">
                  View all alerts
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-borderMain">
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
