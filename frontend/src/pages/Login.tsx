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
            const loggedInUser = await login(form.email, form.password);
            if (loggedInUser && loggedInUser.role === 'admin') { 
                navigate('/Management');
            } else if (loggedInUser) { 
                navigate('/Home');
            } else {
                setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (err: any) { 
            setError('Đăng nhập thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="left-panel">
                    <div className="left-content">
                        <div className="brand">
                            <h3>Lib</h3>
                        </div>
                        
                        <div className="welcome-section">
                            <div className="welcome-text">
                                <h2>Don't have an<br/>account?</h2>
                                <p>Đăng ký để truy cập tất cả các tính năng dịch vụ của chúng tôi.</p>
                            </div>
                            <Link to="/register" className="switch-auth">
                                Đăng ký tài khoản mới?
                            </Link>
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
                                type="email"
                                placeholder="VD: email@domain.com"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input 
                                type="password" 
                                placeholder="Nhập mật khẩu"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                required
                            />
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <button type="submit" className="submit-btn">
                                Đăng nhập <span>➔</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;