import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-section">
                <div className="sidebar-title">Навигация</div>
                <Link to="/public" className="sidebar-item active">
                    <div className="sidebar-item-icon">🏠</div>
                    <span>Главная</span>
                </Link>
                <Link to="/search" className="sidebar-item">
                    <div className="sidebar-item-icon">🔍</div>
                    <span>Поиск</span>
                </Link>
                <Link to="/chats" className="sidebar-item">
                    <div className="sidebar-item-icon">💬</div>
                    <span>Чаты</span>
                </Link>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-title">Категории</div>
                <Link to="/category/programming" className="sidebar-item">
                    <div className="sidebar-item-icon">💻</div>
                    <span>Программирование</span>
                </Link>
                <Link to="/category/business" className="sidebar-item">
                    <div className="sidebar-item-icon">📊</div>
                    <span>Бизнес</span>
                </Link>
                <Link to="/category/design" className="sidebar-item">
                    <div className="sidebar-item-icon">🎨</div>
                    <span>Дизайн</span>
                </Link>
                <Link to="/category/marketing" className="sidebar-item">
                    <div className="sidebar-item-icon">📈</div>
                    <span>Маркетинг</span>
                </Link>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-title">Ваши менторы</div>
                <Link to="/mentor/1" className="sidebar-item">
                    <div className="sidebar-item-icon">👩‍💼</div>
                    <span>Анна К.</span>
                </Link>
                <Link to="/mentor/2" className="sidebar-item">
                    <div className="sidebar-item-icon">👨‍💻</div>
                    <span>Максим П.</span>
                </Link>
            </div>
        </div>
    )
}