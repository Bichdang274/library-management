import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Thư viện nhóm 7</div>
      <ul className="navbar-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/books">Quản lý sách</Link></li>
        <li><Link to="/readers">Người đọc</Link></li>
        <li><Link to="/stats">Thống kê</Link></li>
      </ul>
    </nav>
  );
}
