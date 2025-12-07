import { useState, useEffect } from 'react';
import BorrowChart from '../components/BorrowChart';
import GenreChart from '../components/GenreChart';
import axios from 'axios';
import './StatsPage.css';

export default function StatsPage() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBorrows: 0,
    totalReaders: 0,
    currentBorrows: 0,
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("❌ Lỗi lấy stats:", err));
  }, []);

  const handleExport = async (type: string) => {
    try {
      let url = "";
      let filename = "";

      if (type === "CSV") {
        url = "http://localhost:5000/api/export/all-csv";
        filename = "library-report.csv";
      } else if (type === "Excel") {
        url = "http://localhost:5000/api/export/all-excel";
        filename = "library-report.xlsx";
      } else if (type === "PDF") {
        url = "http://localhost:5000/api/export/all-pdf";
        filename = "library-report.pdf";
      } else {
        alert("Chưa hỗ trợ định dạng này");
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`❌ Lỗi tải file: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
      setOpen(false);
    } catch (error) {
      console.error("❌ Lỗi export:", error);
      alert("Xuất dữ liệu thất bại, xem console để biết chi tiết.");
    }
  };

  return (
    <div className="stats-page">
      <h1 className="page-title">Thống kê thư viện</h1>

      {/* 4 số liệu trên cùng một hàng */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>Tổng số sách</h3>
          <p>{stats.totalBooks}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng lượt mượn</h3>
          <p>{stats.totalBorrows}</p>
        </div>
        <div className="stat-card">
          <h3>Người đọc</h3>
          <p>{stats.totalReaders}</p>
        </div>
        <div className="stat-card overdue">
          <h3>Đang mượn</h3>
          <p>{stats.currentBorrows}</p>
        </div>
      </div>

      {/* 2 biểu đồ trên cùng một hàng */}
      <div className="charts-row">
        <div className="chart-box">
          <BorrowChart />
        </div>
        <div className="chart-box">
          <GenreChart />
        </div>
      </div>

      {/* Nút export */}
      <div className="export-menu">
        <button onClick={() => setOpen(!open)} className="export-button">
          Export
        </button>
        {open && (
          <div className="export-options">
            <button onClick={() => handleExport('CSV')}>CSV</button>
            <button onClick={() => handleExport('Excel')}>Excel</button>
            <button onClick={() => handleExport('PDF')}>PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}
