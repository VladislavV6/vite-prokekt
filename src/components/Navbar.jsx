import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <div className="logo-icon">👨‍🏫</div>
                <Link to="/" className="logo-text">EasyKnowledge</Link>
            </div>
            <div className="nav-links">
                <Link to="/" className="nav-link">Главная</Link>
                <Link to="/" className="nav-link">Менторы</Link>
                <Link to="/chat" className="nav-link">Сообщения</Link>
            </div>
            <div className="auth-buttons">
                {user ? (
                    <div className="user-profile">
                        <Link to="/profile" className="username">{user.name}</Link>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Выйти
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-secondary">Войти</Link>
                        <Link to="/register" className="btn btn-primary">Регистрация</Link>
                    </>
                )}
            </div>
        </nav>
    );
}