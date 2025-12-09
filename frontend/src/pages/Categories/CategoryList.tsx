import React, { useEffect, useState } from 'react';
import type { Category } from '../../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import '../../styles/BooksPage.css';

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            data.sort((a, b) => a.category_id - b.category_id);
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCategory(editingId, name);
                alert('Cập nhật thành công!');
                setEditingId(null);
            } else {
                await createCategory(name);
                alert('Thêm mới thành công!');
            }
            setName('');
            fetchCategories();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa thể loại này?')) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (error: any) {
                alert('Không thể xóa (đang có sách thuộc thể loại này)');
            }
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.category_id);
        setName(cat.category_name);
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
    };

    return (
        <div style={{ padding: '20px' }}>
             <h2 className="vintage-title" style={{ borderBottom: '2px solid #5D4037', paddingBottom: '10px', marginBottom: '20px' }}>
                 QUẢN LÝ THỂ LOẠI
             </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                <div className="vintage-card" style={{ height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 className="vintage-title" style={{ margin: 0 }}>
                            {editingId ? 'SỬA THỂ LOẠI' : '+ THÊM THỂ LOẠI'}
                        </h3>
                        {editingId && <button onClick={handleCancel} className="btn-cancel">HỦY BỎ</button>}
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#5d4037' }}>Tên thể loại *</label>
                            <input 
                                required 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #8D6E63', borderRadius: '4px', boxSizing: 'border-box' }}
                                placeholder="Ví dụ: Khoa học viễn tưởng..."
                            />
                        </div>
                        <button type="submit" className="btn-submit">
                            {editingId ? 'LƯU THAY ĐỔI' : 'LƯU THÔNG TIN'}
                        </button>
                    </form>
                </div>

                <div className="vintage-card">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#EFEBE0', color: '#5D4037' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Tên Thể Loại</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.category_id} style={{ borderBottom: '1px solid #D7CCC8' }}>
                                    <td style={{ padding: '10px' }}>#{cat.category_id}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#3E2723' }}>{cat.category_name}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => handleEdit(cat)} 
                                                className="btn-icon edit" 
                                                title="Sửa"
                                            >
                                                ✎
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.category_id)} 
                                                className="btn-icon delete" 
                                                title="Xóa"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryList;