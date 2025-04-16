import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MentorCard({ name, specialty, status, skills, avatar, userId }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleStartChat = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            console.log("Creating chat between:", user.user_id, "and", userId); // Добавьте лог

            const response = await axios.post('http://localhost:5000/api/chats', {
                user_id: user.user_id.toString(), // Явное преобразование в строку
                participant_id: userId.toString() // Явное преобразование в строку
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Server response:", response.data); // Добавьте лог

            if (response.status === 200 || response.status === 201) {
                navigate(`/chat?chat_id=${response.data.chat_id}`);
            }
        } catch (error) {
            console.error('Error creating chat:', error.response?.data || error.message);
            alert(`Ошибка при создании чата: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleViewProfile = () => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="mentor-card">
            <div className="mentor-banner"></div>
            <div className="mentor-avatar-container">
                <img src={avatar} alt={name} className="mentor-avatar" />
            </div>
            <div className="mentor-info">
                <h3 className="mentor-name">{name}</h3>
                <p className="mentor-specialty">{specialty}</p>
                <div className="mentor-status">
                    <span className={`status-dot status-${status}`}></span>
                    <span>{status === 'online' ? 'Онлайн' : 'Офлайн'}</span>
                </div>
                <div className="mentor-skills">
                    {skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                    ))}
                </div>
                <div className="mentor-actions">
                    <button className="action-btn btn-primary" onClick={handleStartChat}>
                        Написать
                    </button>
                    <button className="action-btn btn-secondary" onClick={handleViewProfile}>
                        Профиль
                    </button>
                </div>
            </div>
        </div>
    );
}