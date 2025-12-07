import { useState, useEffect } from 'react';
import BorrowChart from '../components/BorrowChart';
import GenreChart from '../components/GenreChart';
import axios from 'axios';
import './StatsPage.css';

interface Book { title: string; borrow_count: number; }
interface Reader { reader: string; borrow_count: number; }

export default function StatsPage() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBorrows: 0,
    totalReaders: 0,
    currentBorrows: 0,
  });
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [topReaders, setTopReaders] = useState<Reader[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("❌ Lỗi lấy stats:", err));

    axios.get<Book[]>('http://localhost:5000/api/stats/top-books')
      .then(res => setTopBooks(res.data))
      .catch(err => console.error("❌ Lỗi lấy top books:", err));

    axios.get('http://localhost:5000/api/stats/top-readers')
      .then(res => setTopReaders(res.data.topReaders))
      .catch(err => console.error("❌ Lỗi lấy top readers:", err));
  }, []);

  // Hàm export file
  const handleExport = async (type: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/export/${type}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stats.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Lỗi export:", err);
    }
  };

  return (
    <div className="stats-page">
      <h1 className="page-title">Thống kê thư viện</h1>

      <div className="export-menu">
        <button onClick={() => setOpen(!open)} className="export-button">Export</button>
        {open && (
          <div className="export-options">
            <button onClick={() => handleExport('csv')}>CSV</button>
            <button onClick={() => handleExport('xlsx')}>Excel</button>
            <button onClick={() => handleExport('pdf')}>PDF</button>
          </div>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card"><h3>Tổng số sách</h3><p>{stats.totalBooks}</p></div>
        <div className="stat-card"><h3>Tổng lượt mượn</h3><p>{stats.totalBorrows}</p></div>
        <div className="stat-card"><h3>Người đọc</h3><p>{stats.totalReaders}</p></div>
        <div className="stat-card overdue"><h3>Đang mượn</h3><p>{stats.currentBorrows}</p></div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <BorrowChart />
        </div>
        <div className="chart-box">
          <GenreChart />
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h2>Top 5 Sách Hot</h2>
          <ul className="top-list">
            {topBooks.map((book, idx) => (
              <li key={idx} className={idx === 0 ? 'highlight' : ''}>
                <span className={idx === 0 ? 'rank-badge' : 'rank'}>{`#${idx + 1}`}</span>
                <span className="item-title">{book.title}</span>
                <span className="item-count">{book.borrow_count} lượt mượn</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="chart-box">
          <h2>Top 5 Mọt Sách</h2>
          <ul className="top-list">
            {topReaders.map((reader, idx) => (
              <li key={idx} className={idx === 0 ? 'highlight' : ''}>
                <span className={idx === 0 ? 'rank-badge' : 'rank'}>{`#${idx + 1}`}</span>
                <span className="item-title">{reader.reader}</span>
                <span className="item-count">{reader.borrow_count} lượt mượn</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
