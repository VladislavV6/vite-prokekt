import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        isMentor: false,
        specialty: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Пароли не совпадают');
        }

        if (!formData.agreeTerms) {
            return setError('Необходимо принять условия использования');
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role_id: formData.isMentor ? 1 : 2,
                specialty: formData.isMentor ? formData.specialty : null
            });

            if (response.data && (response.data.user_id || response.data.email)) {
                navigate('/login');
            } else {
                throw new Error('Неверный формат ответа от сервера');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data?.error || err.response.data?.message || 'Ошибка при регистрации');
            } else if (err.request) {
                setError('Сервер не отвечает. Попробуйте позже.');
            } else {
                setError('Ошибка при отправке запроса');
            }
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Navbar />
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Регистрация в MentorConnect</h2>
                    {error && <div className="auth-error">{error}</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Имя</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ваше имя"
                                className="auth-input"
                                required
                            />
                        </div>
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
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Подтвердите пароль</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="mentor"
                                name="isMentor"
                                checked={formData.isMentor}
                                onChange={handleChange}
                            />
                            <label htmlFor="mentor">Я хочу стать ментором</label>
                        </div>
                        {formData.isMentor && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="specialty">Специализация</label>
                                    <input
                                        type="text"
                                        id="specialty"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        placeholder="Ваша специализация"
                                        className="auth-input"
                                        required={formData.isMentor}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="skills">Навыки (через запятую)</label>
                                    <input
                                        type="text"
                                        id="skills"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="JavaScript, React, Управление проектами"
                                        className="auth-input"
                                    />
                                </div>
                            </>
                        )}
                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="terms"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                            />
                            <label htmlFor="terms">Я принимаю условия использования</label>
                        </div>
                        <button
                            type="submit"
                            className="auth-btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                        <div className="auth-footer">
                            Уже есть аккаунт? <Link to="/login" className="auth-link">Войдите</Link>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}