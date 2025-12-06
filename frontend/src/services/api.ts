import axios from 'axios';

// 1. Cấu hình Axios
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log("Current API URL:", 'http://localhost:3000/api');
// 2. Giữ lại Interceptor (Middleware) để tự động gửi Token đăng nhập
// Nếu thiếu đoạn này, dù đăng nhập rồi nhưng server vẫn sẽ báo lỗi "Unauthorized"
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;