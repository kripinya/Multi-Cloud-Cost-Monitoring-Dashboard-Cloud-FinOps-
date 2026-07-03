import { useState, useEffect } from 'react';

export default function Settings() {
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        // Pull user info from the JWT token payload
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ name: payload.name || 'User', email: payload.email || '' });
            } catch {
                // Token decode failed, that's fine
            }
        }
    }, []);

    return (
        <div className="space-y-8 max-w-2xl">
            <h2 className="text-xl font-bold text-textMain">Settings</h2>

            {/* Profile Section */}
            <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-textMain mb-4">Profile</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1">Name</label>
                        <input
                            type="text"
                            value={user.name}
                            readOnly
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-textMain text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
                        <input
                            type="email"
                            value={user.email}
                            readOnly
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-textMain text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Connected Providers */}
            <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-textMain mb-4">Connected Cloud Providers</h3>
                <div className="space-y-3">
                    {[
                        { name: 'AWS', status: 'Connected', color: 'text-aws' },
                        { name: 'Azure', status: 'Connected', color: 'text-azure' },
                        { name: 'GCP', status: 'Connected', color: 'text-gcp' },
                    ].map((provider) => (
                        <div key={provider.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className={`font-semibold text-sm ${provider.color}`}>{provider.name}</span>
                            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">
                                {provider.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-surface border border-red-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-textMuted mb-4">Logging out will clear your session token.</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}
