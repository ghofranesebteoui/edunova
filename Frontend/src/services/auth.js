import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const authAPI = {
    register: (data) => API.post('/register', data),
    login: (data) => API.post('/login', data),
    googleAuth: (code) => API.post('/auth/google', { code }),
    logout: () => API.post('/logout'),
    dashboard: () => API.get('/dashboard'),
};