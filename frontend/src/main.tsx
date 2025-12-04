import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// QUAN TRỌNG: Phải có dòng này để áp dụng giao diện đẹp của nhánh HoangAnh
import './index.css' 

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error("Không tìm thấy phần tử gốc (root element) với id 'root'.")
}