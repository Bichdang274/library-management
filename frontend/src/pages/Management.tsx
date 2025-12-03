import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Management.css'; 
import logoImg from '../assets/logo.png';
import qlbdImg from '../assets/qlbd.png';  // Quản lý bạn đọc
import qlsImg from '../assets/qls.png';    // Quản lý sách
import qltlImg from '../assets/qltl.png';  // Quản lý thể loại
import tpmImg from '../assets/tpm.png';    // Tạo phiếu mượn
import xltsImg from '../assets/xlts.png';  // Xử lý trả sách
import bdttImg from '../assets/bdtt.png';  // Biểu đồ tăng trưởng
import dtqImg from '../assets/dtq.png';    // Dashboard tổng quan

const Management = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Hàm đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ Context để xóa token và user info
    // navigate('/login'); // Hàm logout trong Context thường đã xử lý việc này hoặc chuyển hướng
  };

  return (
    <div className="management-container">
      {/* --- Header --- */}
      <header className="admin-header">
        <div className="logo-section">
            <h1>LIB MANAGEMENT</h1>
            <p>Hệ thống quản lý trung tâm</p>
        </div>
        <div className="user-info">
          <span> {user?.name || 'Admin'}</span>
          <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
        </div>
      </header>

      {/* --- Grid Menu Chức Năng --- */}
      <main className="grid-menu-container">
        
        {/* NHÓM 1: QUẢN LÝ TÀI NGUYÊN */}
        <section className="menu-group">
          <h2 className="group-title"> Quản Lý Dữ Liệu</h2>
          <div className="card-grid">
            <Link to="/readers" className="card card-blue">
              <div className="icon"><img src={qlbdImg} alt="Bạn đọc" className="card-icon" /></div>
              <span>Quản lý Bạn đọc</span>
            </Link>
            
            <Link to="/books" className="card card-blue">
              <div className="icon"><img src={qlsImg} alt="Kho sách" className="card-icon" /></div>
              <span>Quản lý Sách</span>
            </Link>
            
            <Link to="/categories" className="card card-blue">
              <div className="icon"><img src={qltlImg} alt="Thể loại" className="card-icon" /></div>
              <span>Quản lý Thể loại</span>
            </Link>
          </div>
        </section>

        {/* NHÓM 2: NGHIỆP VỤ MƯỢN TRẢ */}
        <section className="menu-group">
          <h2 className="group-title"> Nghiệp Vụ</h2>
          <div className="card-grid">
            <Link to="/borrow" className="card card-green">
              <div className="icon"><img src={tpmImg} alt="Mượn sách" className="card-icon" /></div>
              <span>Tạo Phiếu Mượn</span>
            </Link>

            <Link to="/return" className="card card-green">
              <div className="icon"><img src={xltsImg} alt="Trả sách" className="card-icon" /></div>
              <span>Xử lý Trả sách</span>
            </Link>
          </div>
        </section>

        {/* NHÓM 3: THỐNG KÊ & BÁO CÁO */}
        <section className="menu-group">
          <h2 className="group-title"> Báo Cáo & Thống Kê</h2>
          <div className="card-grid">
            <Link to="/admin/dashboard" className="card card-purple">
              <div className="icon"><img src={dtqImg} alt="Tổng quan" className="card-icon" /></div>
              <span>Dashboard Tổng quan</span>
            </Link>

            <Link to="/admin/stats" className="card card-purple">
              <div className="icon"><img src={bdttImg} alt="Tăng trưởng" className="card-icon" /></div>
              <span>Biểu đồ Tăng trưởng</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Management;