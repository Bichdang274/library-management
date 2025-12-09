import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "../../styles/TransactionPage.module.css";

interface Loan {
  borrow_id: number;
  reader_id: number;
  book_id: number;
  reader_name: string;
  book_name: string;
  borrow_date: string;
  due_date: string;
  status: string;
}

const TransactionPage = () => {
  const [activeTab, setActiveTab] = useState('borrow');
  
  const [formData, setFormData] = useState({ reader_id: '', book_id: '', due_date: '' });
  
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchActiveLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions/active');
      setActiveLoans(res.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'return') {
      fetchActiveLoans();
    }
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      await axios.post('http://localhost:5000/api/transactions/borrow', formData);
      setMessage({ text: 'Tạo phiếu mượn thành công!', type: 'success' });
      setFormData({ reader_id: '', book_id: '', due_date: '' });
    } catch (error: any) { 
      setMessage({ 
        text: error.response?.data?.message || 'Có lỗi xảy ra', 
        type: 'error' 
      });
    }
  };

  const handleReturn = async (borrow_id: number, book_id: number) => {
    if (!window.confirm("Xác trả lại sách này?")) return;
    try {
      await axios.post('http://localhost:5000/api/transactions/return', { borrow_id, book_id });
      fetchActiveLoans();
      alert("Đã cập nhật trả sách thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật trả sách.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Nghiệp Vụ</div>
        
        <button 
          className={`${styles.menuButton} ${activeTab === 'borrow' ? styles.active : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          <span>📖</span> Tạo Phiếu Mượn
        </button>

        <button 
          className={`${styles.menuButton} ${activeTab === 'return' ? styles.active : ''}`}
          onClick={() => setActiveTab('return')}
        >
          <span>↩️</span> Xử Lý Trả Sách
        </button>
      </div>

      <div className={styles.mainContent}>
        
        <div className={styles.pageHeader}>
          <h1 className={styles.headerTitle}>
            {activeTab === 'borrow' ? 'Thêm Phiếu Mượn Mới' : 'Danh Sách Sách Đang Mượn'}
          </h1>
          <p className={styles.headerSubtitle}>Hệ thống quản lý thư viện trung tâm</p>
        </div>

        {message.text && (
          <div style={{
            padding: '10px', 
            marginBottom: '20px', 
            backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: message.type === 'success' ? '#2e7d32' : '#c62828',
            border: `1px solid ${message.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`
          }}>
            {message.text}
          </div>
        )}

        {activeTab === 'borrow' && (
          <div className={styles.cardForm}>
            <div className={styles.cardTitle}>Thông Tin Phiếu Mượn</div>
            <form onSubmit={handleBorrow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mã Độc Giả *</label>
                <input 
                  className={styles.input} 
                  type="number" 
                  name="reader_id" 
                  value={formData.reader_id} 
                  onChange={handleChange} 
                  placeholder="Nhập ID độc giả..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mã Sách *</label>
                <input 
                  className={styles.input} 
                  type="number" 
                  name="book_id" 
                  value={formData.book_id} 
                  onChange={handleChange} 
                  placeholder="Nhập ID sách..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ngày Hẹn Trả *</label>
                <input 
                  className={styles.input} 
                  type="date" 
                  name="due_date" 
                  value={formData.due_date} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <button type="submit" className={styles.btnSubmit}>
                Lưu Phiếu Mượn
              </button>
            </form>
          </div>
        )}

        {activeTab === 'return' && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã Phiếu</th>
                  <th>Độc Giả</th>
                  <th>Tên Sách</th>
                  <th>Ngày Mượn</th>
                  <th>Hạn Trả</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', fontStyle: 'italic', padding: '30px'}}>
                      Hiện không có sách nào đang được mượn.
                    </td>
                  </tr>
                ) : (
                  activeLoans.map((loan) => {
                    const isOverdue = new Date(loan.due_date) < new Date();
                    return (
                      <tr key={loan.borrow_id}>
                        <td>#{loan.borrow_id}</td>
                        <td>{loan.reader_name}</td>
                        <td style={{fontWeight: 'bold'}}>{loan.book_name}</td>
                        <td>{new Date(loan.borrow_date).toLocaleDateString('vi-VN')}</td>
                        <td style={{color: isOverdue ? '#d32f2f' : 'inherit'}}>
                          {new Date(loan.due_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <span className={`${styles.statusTag} ${isOverdue ? styles.overdue : styles.borrowed}`}>
                            {isOverdue ? 'Quá Hạn' : 'Đang Mượn'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={styles.btnAction}
                            onClick={() => handleReturn(loan.borrow_id, loan.book_id)}
                          >
                            Đã Trả
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionPage;