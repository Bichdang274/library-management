import { useState, useContext, type FormEvent } from 'react'; 
import { AuthContext, type AuthContextType } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

interface LoginFormState {
    email: string;
    password: string;
}

const Login = () => {
    const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
    const { login } = useContext(AuthContext) as AuthContextType;     
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => { 
        e.preventDefault();
        setError('');
        
        try {
            // Gọi hàm login, nhận lại object User
            const loggedInUser = await login(form.email, form.password);
            
            // FIX LỖI TYPESCRIPT & LOGIC ĐIỀU HƯỚNG
            if (loggedInUser) {
                // Kiểm tra role trực tiếp từ object user
                if (loggedInUser.role === 'admin') {
                    console.log("Là Admin/Manager -> Chuyển hướng Management");
                    navigate('/Management');
                } else if (loggedInUser.role === 'reader') {
                    console.log("Là Reader -> Chuyển hướng Home");
                    navigate('/Home');
                } else {
                    // Fallback nếu không có role
                    navigate('/Home');
                }
            } else {
                setError('Không nhận được dữ liệu phản hồi.');
            }

        } catch (err: any) { 
            const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
            setError(message);
        }
    };

    // ... (Phần return JSX giữ nguyên như code cũ của bạn)
    return (
        <div className="login-page">
            <div className="login-container">
                <div className="left-panel">
                    <div className="left-content">
                        <div className="brand"><h3>Lib</h3></div>
                        <div className="welcome-section">
                            <div className="welcome-text">
                                <h2>Don't have an<br/>account?</h2>
                                <p>Đăng ký để truy cập tất cả các tính năng dịch vụ của chúng tôi.</p>
                            </div>
                            <Link to="/register" className="switch-auth">Đăng ký tài khoản mới?</Link>
                        </div>
                    </div>
                </div>
                <div className="right-panel">
                    <h2>Đăng nhập</h2>
                    {error && <p className="error-msg">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" placeholder="VD: email@domain.com"
                                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input 
                                type="password" placeholder="Nhập mật khẩu"
                                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                                required
                            />
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <button type="submit" className="submit-btn">Đăng nhập <span>➔</span></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;