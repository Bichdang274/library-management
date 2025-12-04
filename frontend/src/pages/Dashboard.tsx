import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 className="vintage-title" style={{ fontSize: '32px', marginBottom: '10px' }}>HỆ THỐNG QUẢN LÝ TRUNG TÂM</h2>
                <p style={{ color: '#8D6E63', fontStyle: 'italic' }}>Chào mừng trở lại, Thủ thư.</p>
            </div>

            {/* NHÓM 1: QUẢN LÝ DỮ LIỆU */}
            <h3 style={{ borderBottom: '2px solid #D7CCC8', paddingBottom: '10px', color: '#5D4037', marginTop: '30px' }}>
                📂 Quản Lý Dữ Liệu
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                
                {/* Card: Quản lý Sách */}
                <Link to="/books" style={{ textDecoration: 'none' }}>
                    <div className="vintage-card dashboard-card">
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📚</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3E2723' }}>Quản lý Sách</div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>Thêm, sửa, xóa và tìm kiếm sách</div>
                    </div>
                </Link>

                {/* Card: Quản lý Thể loại */}
                <Link to="/categories" style={{ textDecoration: 'none' }}>
                    <div className="vintage-card dashboard-card">
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏷️</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3E2723' }}>Quản lý Thể loại</div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>Phân loại danh mục sách</div>
                    </div>
                </Link>

                 {/* Card: Bạn đọc (Placeholder - Phần của người khác) */}
                 <div className="vintage-card dashboard-card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3E2723' }}>Quản lý Bạn đọc</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>(Đang phát triển)</div>
                </div>
            </div>

            {/* NHÓM 2: NGHIỆP VỤ (Placeholder) */}
            <h3 style={{ borderBottom: '2px solid #D7CCC8', paddingBottom: '10px', color: '#5D4037', marginTop: '40px' }}>
                🛠️ Nghiệp Vụ
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="vintage-card dashboard-card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>✍️</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3E2723' }}>Tạo Phiếu Mượn</div>
                </div>
                <div className="vintage-card dashboard-card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>↩️</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3E2723' }}>Xử lý Trả sách</div>
                </div>
            </div>

            {/* Style riêng cho hiệu ứng hover */}
            <style>{`
                .dashboard-card {
                    text-align: center;
                    padding: 30px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(93, 64, 55, 0.2);
                    border-color: #5D4037;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;