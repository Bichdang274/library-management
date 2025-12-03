import React, { useEffect, useState, useRef } from 'react';
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
        total_copies: 1
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Để hiện ảnh preview
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                total_copies: initialData.total_copies
            });
            // Nếu sách đang sửa có ảnh, hiển thị ảnh đó
            if (initialData.image_url) {
                setPreviewUrl(`http://localhost:3000${initialData.image_url}`);
            } else {
                setPreviewUrl(null);
            }
            setSelectedFile(null);
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
            total_copies: 1
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Tạo URL ảo để preview ảnh ngay lập tức
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('author', formData.author);
            data.append('publisher', formData.publisher);
            data.append('year_published', formData.year_published.toString());
            data.append('category_id', formData.category_id.toString());
            data.append('total_copies', formData.total_copies.toString());
            
            if (selectedFile) {
                data.append('image', selectedFile);
            }

            if (initialData) {
                await updateBook(initialData.book_id, data);
                alert('Cập nhật thành công!');
                onCancel();
            } else {
                await createBook(data);
                alert('Thêm mới thành công!');
                resetForm();
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        }
    };

    // Style chung cho input để thẳng hàng
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
                    <button onClick={onCancel} className="btn-cancel">
                        HỦY BỎ
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Tên Sách */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tên sách *</label>
                    <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                </div>

                {/* Ảnh Bìa (Custom UI) */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ảnh bìa</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }} 
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px dashed #8D6E63', 
                        padding: '10px', 
                        cursor: 'pointer',
                        borderRadius: '4px',
                        backgroundColor: '#FFF'
                    }}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" style={{ height: '100px', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: '#888' }}>+ Bấm để chọn ảnh</span>
                        )}
                    </label>
                </div>

                {/* Tác giả */}
                <div>
                    <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Tác giả</label>
                    <input name="author" value={formData.author} onChange={handleChange} style={inputStyle} />
                </div>

                {/* Thể loại */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Thể loại *</label>
                    <select required name="category_id" value={formData.category_id} onChange={handleChange} style={{...inputStyle, backgroundColor: '#fff'}}>
                        <option value={0}>-- Chọn thể loại --</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>

                {/* Nhà xuất bản & Năm */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Nhà xuất bản</label>
                        <input name="publisher" value={formData.publisher} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Năm</label>
                        <input 
                            type="number" 
                            name="year_published" 
                            max={new Date().getFullYear()}
                            value={formData.year_published} 
                            onChange={handleChange} 
                            style={inputStyle} 
                        />
                    </div>
                </div>

                {/* Số lượng */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tổng số lượng</label>
                    <input type="number" min="1" name="total_copies" value={formData.total_copies} onChange={handleChange} style={inputStyle} />
                </div>

                {/* Nút Submit */}
                <button type="submit" className="btn-submit">
                    {initialData ? 'LƯU THAY ĐỔI' : 'LƯU THÔNG TIN'}
                </button>
            </form>
        </div>
    );
};

export default BookForm;