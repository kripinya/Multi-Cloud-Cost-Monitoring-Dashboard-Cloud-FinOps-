import { useState, useEffect } from 'react';
import { User, Cloud, Bell, Palette, Shield, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState({ name: '', email: '' });
    const [notifPrefs, setNotifPrefs] = useState({
        budgetWarnings: true,
        budgetCritical: true,
        weeklyReport: false,
    });

    useEffect(() => {
        // Pull user info from the JWT token payload
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ name: payload.name || 'User', email: payload.email || '' });
            } catch {
                // Token decode failed
            }
        }

        // Load notification prefs from localStorage
        const savedPrefs = localStorage.getItem('finops-notif-prefs');
        if (savedPrefs) {
            try { setNotifPrefs(JSON.parse(savedPrefs)); } catch {}
        }
    }, []);

    const updateNotifPref = (key) => {
        const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
        setNotifPrefs(updated);
        localStorage.setItem('finops-notif-prefs', JSON.stringify(updated));
    };

    const providers = [
        { name: 'AWS', status: 'Connected', color: 'text-aws', bgColor: 'bg-aws/10', borderColor: 'border-aws/20' },
        { name: 'Azure', status: 'Connected', color: 'text-azure', bgColor: 'bg-azure/10', borderColor: 'border-azure/20' },
        { name: 'GCP', status: 'Connected', color: 'text-gcp', bgColor: 'bg-gcp/10', borderColor: 'border-gcp/20' },
    ];

    // Reusable section card
    const SectionCard = ({ icon: Icon, title, children, danger }) => (
        <div className={`bg-surface border rounded-2xl p-6 shadow-sm ${danger ? 'border-red-200 dark:border-red-500/20' : 'border-borderMain'}`}>
            <div className="flex items-center gap-2.5 mb-5">
                <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-500/10' : 'bg-primary/10'}`}>
                    <Icon size={16} className={danger ? 'text-red-500' : 'text-primary'} />
                </div>
                <h3 className={`font-semibold text-sm ${danger ? 'text-red-500' : 'text-textMain'}`}>{title}</h3>
            </div>
            {children}
        </div>
    );

    // Toggle switch component
    const Toggle = ({ enabled, onToggle, label, description }) => (
        <div className="flex items-center justify-between py-3 border-b border-borderLight last:border-0">
            <div>
                <p className="text-sm font-medium text-textMain">{label}</p>
                {description && <p className="text-xs text-textMuted mt-0.5">{description}</p>}
            </div>
            <button
                onClick={onToggle}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-borderMain'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold text-textMain">Settings</h2>

            {/* Profile Section */}
            <SectionCard icon={User} title="Profile">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                        <User size={24} className="text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-textMain">{user.name}</p>
                        <p className="text-sm text-textMuted">{user.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-textMuted mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={user.name}
                            readOnly
                            className="w-full p-2.5 bg-surfaceHover border border-borderMain rounded-xl text-textMain text-sm focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-textMuted mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={user.email}
                            readOnly
                            className="w-full p-2.5 bg-surfaceHover border border-borderMain rounded-xl text-textMain text-sm focus:outline-none"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Appearance */}
            <SectionCard icon={Palette} title="Appearance">
                <p className="text-sm text-textMuted mb-4">Choose how VyayaDrishti looks for you.</p>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { key: 'light', label: 'Light', icon: Sun },
                        { key: 'dark', label: 'Dark', icon: Moon },
                        { key: 'system', label: 'System', icon: Monitor },
                    ].map(opt => {
                        const isActive = theme === opt.key || 
                            (opt.key === 'system' && !['light', 'dark'].includes(theme));
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => {
                                    if (opt.key === 'system') {
                                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                        localStorage.setItem('finops-theme', prefersDark ? 'dark' : 'light');
                                        window.location.reload();
                                    } else if (theme !== opt.key) {
                                        toggleTheme();
                                    }
                                }}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    isActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-borderMain hover:border-primary/50 bg-surfaceHover'
                                }`}
                            >
                                <Icon size={20} className={isActive ? 'text-primary' : 'text-textMuted'} />
                                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-textMuted'}`}>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Notification Preferences */}
            <SectionCard icon={Bell} title="Notification Preferences">
                <Toggle
                    enabled={notifPrefs.budgetWarnings}
                    onToggle={() => updateNotifPref('budgetWarnings')}
                    label="Budget Warnings"
                    description="Get notified when spending reaches 80% of budget"
                />
                <Toggle
                    enabled={notifPrefs.budgetCritical}
                    onToggle={() => updateNotifPref('budgetCritical')}
                    label="Critical Alerts"
                    description="Get notified when spending exceeds 100% of budget"
                />
                <Toggle
                    enabled={notifPrefs.weeklyReport}
                    onToggle={() => updateNotifPref('weeklyReport')}
                    label="Weekly Cost Report"
                    description="Receive a summary of cloud costs every Monday"
                />
            </SectionCard>

            {/* Connected Cloud Providers */}
            <SectionCard icon={Cloud} title="Connected Cloud Providers">
                <div className="space-y-3">
                    {providers.map((provider) => (
                        <div key={provider.name} className={`flex items-center justify-between p-3.5 rounded-xl border ${provider.borderColor} ${provider.bgColor}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${provider.bgColor} border ${provider.borderColor} flex items-center justify-center`}>
                                    <span className={`text-xs font-bold ${provider.color}`}>{provider.name[0]}</span>
                                </div>
                                <div>
                                    <span className={`font-semibold text-sm ${provider.color}`}>{provider.name}</span>
                                    <p className="text-[11px] text-textMuted">API key configured</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                {provider.status}
                            </span>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard icon={Shield} title="Danger Zone" danger>
                <p className="text-sm text-textMuted mb-4">Logging out will clear your session token. You will need to sign in again.</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                    <LogOut size={16} />
                    Log Out
                </button>
            </SectionCard>
        </div>
    );
}
