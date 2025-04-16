import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css'

export default function Chat() {
    return (
        <div className="page-container">
            <Navbar />
            <div className="main-content">
                <Sidebar />
                <ChatArea />
            </div>
        </div>
    );
}

function ChatArea() {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState(null);
    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [user]);

    useEffect(() => {
        if (activeChat) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Обновление каждые 5 секунд
            return () => clearInterval(interval);
        }
    }, [activeChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChats = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/chats?user_id=${user.user_id}`);
            setChats(response.data);
            if (response.data.length > 0 && !activeChat) {
                setActiveChat(response.data[0].chat_id);
                setRecipient({
                    id: response.data[0].participant_id,
                    name: response.data[0].participant_name,
                    avatar: response.data[0].participant_avatar
                });
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/messages?chat_id=${activeChat}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            await axios.post('http://localhost:5000/api/messages', {
                chat_id: activeChat,
                sender_id: user.user_id,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="content-area chat-page">
            <div className="chat-container">
                <div className="chat-list">
                    <h3>Чаты</h3>
                    {chats.length > 0 ? (
                        chats.map(chat => (
                            <div
                                key={chat.chat_id}
                                className={`chat-item ${activeChat === chat.chat_id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveChat(chat.chat_id);
                                    setRecipient({
                                        id: chat.participant_id,
                                        name: chat.participant_name,
                                        avatar: chat.participant_avatar
                                    });
                                }}
                            >
                                <img src={chat.participant_avatar || `https://i.pravatar.cc/150?u=${chat.participant_id}`}
                                     alt={chat.participant_name}
                                     className="chat-avatar" />
                                <div className="chat-info">
                                    <h4>{chat.participant_name}</h4>
                                    <p className="last-message">{chat.last_message?.substring(0, 30)}...</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>У вас пока нет чатов</p>
                    )}
                </div>

                <div className="chat-messages">
                    {activeChat ? (
                        <>
                            <div className="chat-header">
                                <img src={recipient?.avatar || `https://i.pravatar.cc/150?u=${recipient?.id}`}
                                     alt={recipient?.name}
                                     className="recipient-avatar" />
                                <h3>{recipient?.name}</h3>
                            </div>

                            <div className="messages-container">
                                {messages.map(message => (
                                    <div key={message.message_id}
                                         className={`message ${message.sender_id === user.user_id ? 'sent' : 'received'}`}>
                                        <img src={message.sender_avatar || `https://i.pravatar.cc/150?u=${message.sender_id}`}
                                             alt={message.sender_name}
                                             className="message-avatar" />
                                        <div className="message-content">
                                            <p>{message.content}</p>
                                            <span className="message-time">
                                                {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="message-input">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Напишите сообщение..."
                                />
                                <button onClick={handleSendMessage}>Отправить</button>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <p>Выберите чат или начните новый</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}