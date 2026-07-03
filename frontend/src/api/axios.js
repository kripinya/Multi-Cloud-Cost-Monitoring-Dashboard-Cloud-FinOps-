import axios from 'axios';

// Create a central instance so we don't have to type the full URL everywhere
const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: This automatically attaches the JWT token to every request if the user is logged in
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
