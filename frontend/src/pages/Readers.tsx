import { useEffect, useState, useContext, FormEvent } from 'react';
import api from '../services/api';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import '../styles/Readers.css';
import React from 'react';


interface Reader {
    reader_id?: number | string;
    id?: number | string;
    name: string;
    email: string;
    phone_number: string | null;
    address: string | null;
    quota: number | string | null; 
}


interface ReaderFormState {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    quota: string;
    password?: string; 
}

const initialFormState: ReaderFormState = { 
    name: '', 
    email: '', 
    phone_number: '', 
    address: '', 
    quota: '', 
    password: '' 
};

const Readers: React.FC = () => {
    const { user, logout } = useContext(AuthContext) as AuthContextType; 
    const [readers, setReaders] = useState<Reader[]>([]);
    const [form, setForm] = useState<ReaderFormState>(initialFormState);
    const [editingId, setEditingId] = useState<number | string | null>(null);

    const fetchReaders = async () => {
        try {
            const res = await api.get('/readers');
            
            let data: Reader[] = [];
            if (res.data && Array.isArray(res.data.data)) {
                data = res.data.data as Reader[];
            } else if (Array.isArray(res.data)) {
                data = res.data as Reader[];
            }
            
            setReaders(data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setReaders([]); 
        }
    };

    useEffect(() => { fetchReaders(); }, []);
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit: any = { ...form }; 
            if (editingId && dataToSubmit.password === '') {
                delete dataToSubmit.password;
            }

            if (editingId) {
                await api.put(`/readers/${editingId}`, dataToSubmit);
            } else {
                await api.post('/readers', dataToSubmit);
            }
            
            setForm(initialFormState); 
            setEditingId(null);
            fetchReaders();
        } catch (err: any) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };
    const handleDelete = async (id: number | string | undefined) => {
        if (!id) return; 

        if(window.confirm('Bạn có chắc muốn xóa bạn đọc này?')) {
            try {
                await api.delete(`/readers/${id}`);
                fetchReaders();
            } catch (err) {
                alert('Không thể xóa');
            }
        }
    };

    const handleEdit = (reader: Reader) => {
        setForm({
            name: reader.name,
            email: reader.email,
            phone_number: reader.phone_number || '',
            address: reader.address || '',
            quota: (reader.quota !== null && reader.quota !== undefined) ? String(reader.quota) : '', 
            password: '' 
        });
        setEditingId(reader.reader_id || reader.id || null);
    }

    const handleCancel = () => {
        setEditingId(null);
        setForm(initialFormState);
    };

    return (
        <div className="readers-page management-container">
            
            <div className="page-header">
                <div className="header-title">
                    <h2>Danh Sách Bạn Đọc</h2>
                    <span className="subtitle">Hồ sơ lưu trữ thành viên</span>
                </div>
                <div className="user-control">
                    <span>Thủ thư: <strong>{user?.name}</strong></span>
                    <button onClick={logout} className="btn-logout-small">Thoát</button>
                </div>
            </div>
            
            <div className="readers-content">
                
                {/* FORM SECTION */}
                <div className="form-section vintage-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', textShadow: 'none' }}>
                        <span>{editingId ? '🖊️' : '➕'}</span>
                        <span>{editingId ? 'Chỉnh sửa hồ sơ' : 'Thêm thành viên mới'}</span>
                    </h3>
                    <form onSubmit={handleSubmit} className="vintage-form">
                        <div className="form-group">
                            <label>Họ và tên <span style={{color:'red'}}>*</span></label>
                            <input placeholder="Nhập tên..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Email liên hệ <span style={{color:'red'}}>*</span></label>
                            <input type="email" placeholder="email@domain.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                        </div>


                        {!editingId && (
                            <div className="form-group">
                                <label>Mật khẩu <span style={{color:'red'}}>*</span></label>
                                <input 
                                    type="password"
                                    placeholder="Nhập mật khẩu..." 
                                    value={form.password || ''} 
                                    onChange={e => setForm({ ...form, password: e.target.value })} 
                                    required 
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input placeholder="09xxxx..." value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input placeholder="Nơi ở..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Hạn mức (Quota)</label>
                            <input type="number" placeholder="Số lượng sách (Mặc định: 5)" value={form.quota} onChange={e => setForm({...form, quota: e.target.value})} /> 
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">{editingId ? 'Lưu Hồ Sơ' : 'Thêm Mới'}</button>
                            {editingId && <button type="button" onClick={handleCancel} className="btn-cancel">Hủy Bỏ</button>}
                        </div>
                    </form>
                </div>

                {/* TABLE SECTION */}
                <div className="table-section vintage-card">
                    <table className="vintage-table">
                        <thead>
                            <tr>
                                <th>Mã số</th>
                                <th>Họ tên</th>
                                <th>Liên lạc</th>
                                <th>Địa chỉ</th>
                                <th>Quota</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readers.length > 0 ? (
                                readers.map(r => (
                                    <tr key={r.reader_id || r.id}>
                                        <td className="id-col">#{r.reader_id || r.id}</td>
                                        <td className="name-col">{r.name}</td>
                                        <td>
                                            <div style={{fontSize: '0.9em'}}>{r.email}</div>
                                            <div style={{fontSize: '0.85em', color: '#795548'}}>{r.phone_number}</div>
                                        </td>
                                        <td>{r.address}</td>
                                        <td style={{textAlign: 'center', fontWeight: 'bold'}}>{r.quota}</td>
                                        <td className="action-col">
                                            <button onClick={() => handleEdit(r)} className="btn-icon edit" title="Sửa">✎</button>
                                            <button 
                                                onClick={() => handleDelete(r.reader_id || r.id)} 
                                                className="btn-icon delete" 
                                                title="Xóa"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="empty-row">
                                        Chưa có dữ liệu trong hồ sơ.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Readers;