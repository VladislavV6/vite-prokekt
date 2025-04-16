import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MentorCard from './components/MentorCard';
import axios from 'axios';

export default function Home() {
    return (
        <>
            <Navbar />
            <div className="main-content">
                <Sidebar />
                <ContentArea />
            </div>
            <Footer />
        </>
    );
}

function ContentArea() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/mentors');
                setMentors(response.data);
            } catch (error) {
                console.error('Error fetching mentors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    if (loading) {
        return <div className="content-area">Загрузка менторов...</div>;
    }

    return (
        <div className="content-area">
            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Найти ментора по навыкам, имени или специализации..."
                />
                <button className="search-btn">🔍</button>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Рекомендуемые менторы</h2>
            <div className="mentors-grid">
                {mentors.length > 0 ? (
                    mentors.map(mentor => (
                        <MentorCard
                            key={mentor.user_id}
                            name={mentor.name}
                            specialty={mentor.specialty || 'Ментор'}
                            status="online"
                            skills={mentor.skills || ['Наставничество']}
                            avatar={mentor.avatar || `https://i.pravatar.cc/150?u=${mentor.email}`}
                            userId={mentor.user_id} // Добавьте это
                        />
                    ))
                ) : (
                    <p>На данный момент нет доступных менторов</p>
                )}
            </div>
        </div>
    );
}