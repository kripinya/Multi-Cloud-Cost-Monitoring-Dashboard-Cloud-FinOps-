import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevents the page from refreshing on submit
        setError('');

        try {
            // Making the POST request to your Express backend
            const response = await api.post('/auth/login', { email, password });

            // Save the token to localStorage
            localStorage.setItem('token', response.data.token);

            // Redirect to the Dashboard
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
            <div className="bg-surface border border-borderMain p-8 rounded-2xl shadow-sm w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-textMain tracking-tight">Welcome Back</h1>
                    <p className="text-textMuted text-sm mt-2">Log in to VyayaDrishti</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-2.5 bg-surface border border-borderMain rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2.5 bg-surface border border-borderMain rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-medium p-2.5 rounded-xl hover:bg-blue-700 transition-colors mt-2"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-center text-sm text-textMuted mt-6">
                    Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
                </p>

            </div>
        </div>
    );
}
