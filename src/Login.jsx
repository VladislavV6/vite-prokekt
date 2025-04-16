import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/');
            } else {
                throw new Error('Неверный формат ответа от сервера');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data?.error || 'Ошибка при входе');
            } else if (err.request) {
                setError('Сервер не отвечает. Попробуйте позже.');
            } else {
                setError('Ошибка при отправке запроса');
            }
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Navbar />
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Вход в MentorConnect</h2>
                    {error && <div className="auth-error">{error}</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Пароль</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="auth-input"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="auth-btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                        <div className="auth-footer">
                            Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрируйтесь</Link>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}