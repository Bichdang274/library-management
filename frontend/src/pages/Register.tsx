import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Register.css'; 

interface RegisterFormState {
    name: string;
    email: string;
    password: string;
    phone_number: string;
    address: string;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<RegisterFormState>({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        address: ''
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.name || !form.email || !form.password) {
            setError('Vui lòng điền các trường bắt buộc (*)');
            return;
        }

        try {
            await api.post('/auth/register', form);
            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="fullscreen-container">
            <div className="background-overlay"></div>
            
            <div className="card-container">
                <div className="image-panel">
                    <div className="logo">
                        <div className="logo-text">LIB</div>
                    </div>
                    <h2 className="panel-title">Welcome Back!</h2>
                    <p className="panel-text">
                        Đã có tài khoản? Đăng nhập để sử dụng các tính năng của chúng tôi.
                    </p>
                    <Link to="/login" className="link-button">Đăng nhập</Link>
                </div>
                
                <div className="form-panel">
                    <h2 className="form-title">Đăng Ký Tài Khoản</h2>
                    
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    
                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="input-group">
                            <label className="label">Họ tên <span style={{color: 'red'}}>*</span></label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} required className="form-input" />
                        </div>

                        <div className="input-group">
                            <label className="label">Email <span style={{color: 'red'}}>*</span></label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} required className="form-input" />
                        </div>

                        <div className="input-group">
                            <label className="label">Mật khẩu <span style={{color: 'red'}}>*</span></label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} required className="form-input" />
                        </div>

                        <div className="input-group">
                            <label className="label">Số điện thoại</label>
                            <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} className="form-input" />
                        </div>

                        <div className="input-group">
                            <label className="label">Địa chỉ</label>
                            <input type="text" name="address" value={form.address} onChange={handleChange} className="form-input" />
                        </div>

                        <button type="submit" className="form-button">
                            Đăng Ký <span className="arrow">&rarr;</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;