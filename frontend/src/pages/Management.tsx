import  { useContext } from 'react';
import { Link} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Management.css'; 
import qlbdImg from '../assets/qlbd.png';  
import qlsImg from '../assets/qls.png';    
import qltlImg from '../assets/qltl.png';  
import tpmImg from '../assets/tpm.png';    
import bdttImg from '../assets/bdtt.png';  

const Management = () => {
  const { user, logout } = useContext(AuthContext);

  
  const handleLogout = () => {
    logout(); 
    
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
            <Link to="/transactionPage" className="card card-green">
              <div className="icon"><img src={tpmImg} alt="Mượn sách" className="card-icon" /></div>
              <span>Quản lý mượn-trả</span>
            </Link>
          </div>
        </section>

        {/* NHÓM 3: THỐNG KÊ & BÁO CÁO */}
        <section className="menu-group">
          <h2 className="group-title"> Báo Cáo & Thống Kê</h2>
          <div className="card-grid">

            <Link to="/statsPage" className="card card-purple">
              <div className="icon"><img src={bdttImg} alt="Tăng trưởng" className="card-icon" /></div>
              <span>Thống kê & Báo cáo</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Management;