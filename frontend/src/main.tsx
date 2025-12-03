import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- Bỏ đuôi .js, để Vite/TS tự giải quyết thành App.tsx

// Kiểm tra null cho document.getElementById('root') là cần thiết trong TS
const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Không tìm thấy phần tử gốc (root element) với id 'root'.");
}