import React, { useEffect, useState } from 'react';
import { getCategories } from '../../services/categoryService';
import { createBook, updateBook } from '../../services/bookService';
import type { Category, Book } from '../../types';

interface Props {
    onSuccess: () => void;
    initialData: Book | null;
    onCancel: () => void;
}

const BookForm: React.FC<Props> = ({ onSuccess, initialData, onCancel }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        author: '',
        publisher: '',
        year_published: new Date().getFullYear(),
        category_id: 0,
        total_copies: 1,
        image_url: '' 
    });

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                author: initialData.author || '',
                publisher: initialData.publisher || '',
                year_published: initialData.year_published || new Date().getFullYear(),
                category_id: initialData.category_id,
                total_copies: initialData.total_copies,
                image_url: initialData.image_url || ''
            });
        } else {
            resetForm();
        }
    }, [initialData]);

    const resetForm = () => {
        setFormData({
            name: '',
            author: '',
            publisher: '',
            year_published: new Date().getFullYear(),
            category_id: 0,
            total_copies: 1,
            image_url: ''
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (initialData) {
                await updateBook(initialData.book_id, formData);
                alert('Cập nhật thành công!');
                onCancel();
            } else {
                await createBook(formData);
                alert('Thêm mới thành công!');
                resetForm();
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        }
    };

    const inputStyle = {
        width: '100%', 
        padding: '10px', 
        border: '1px solid #8D6E63', 
        borderRadius: '4px',
        boxSizing: 'border-box' as const
    };

    return (
        <div className="vintage-card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="vintage-title" style={{ margin: 0 }}>
                    {initialData ? 'CẬP NHẬT SÁCH' : '+ THÊM SÁCH MỚI'}
                </h3>
                {initialData && (
                    <button onClick={onCancel} className="btn-cancel">HỦY BỎ</button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tên sách *</label>
                    <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Link Ảnh bìa (URL)</label>
                    <input 
                        type="text" 
                        name="image_url" 
                        placeholder="VD: https://i.imgur.com/abc.jpg"
                        value={formData.image_url} 
                        onChange={handleChange} 
                        style={inputStyle} 
                    />
                    {formData.image_url && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <img 
                                src={formData.image_url} 
                                alt="Preview" 
                                style={{ height: '150px', objectFit: 'contain', border: '1px solid #ccc' }} 
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Lỗi+Link'}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Tác giả</label>
                    <input name="author" value={formData.author} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Thể loại *</label>
                    <select required name="category_id" value={formData.category_id} onChange={handleChange} style={{...inputStyle, backgroundColor: '#fff'}}>
                        <option value={0}>-- Chọn thể loại --</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Nhà xuất bản</label>
                        <input name="publisher" value={formData.publisher} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Năm</label>
                        <input type="number" name="year_published" max={new Date().getFullYear()} value={formData.year_published} onChange={handleChange} style={inputStyle} />
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tổng số lượng</label>
                    <input type="number" min="1" name="total_copies" value={formData.total_copies} onChange={handleChange} style={inputStyle} />
                </div>

                <button type="submit" className="btn-submit">
                    {initialData ? 'LƯU THAY ĐỔI' : 'LƯU THÔNG TIN'}
                </button>
            </form>
        </div>
    );
};

export default BookForm;