import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import styles from './Chat.module.css';

const SOCKET_SERVER_URL = 'http://localhost:8000';

function Chat() {
    const { isAuthenticated } = useAuth();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const sendMessage = () => {
        if (message.trim() && selectedUser) {
            // Burada, mesajı gönderme işlemi gerçekleştirilecek
            // Örneğin, socket.emit('send message', { to: selectedUser.id, message: message });
            console.log(`Message "${message}" sent to ${selectedUser.username}`);
            setMessage(''); // Mesaj gönderildikten sonra inputu temizle
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
    };

    useEffect(() => {
        console.log(isAuthenticated);
        if (isAuthenticated) {
            const socket = io(SOCKET_SERVER_URL, {
                withCredentials: true,
                query: { token: localStorage.getItem('token') }
            });

            socket.on('user info', (userInfo) => {
                setCurrentUser(userInfo);
            });

            socket.on('users', (usersList) => {
                setUsers(usersList);
            });

            return () => socket.close();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    const dummyMessages = [
        { id: 1, content: 'Merhaba', sender: 'User1', fromMe: true },
        { id: 2, content: 'Nasılsın?', sender: 'User2', fromMe: false },
        { id: 3, content: 'İyi, sen nasılsın?', sender: 'User1', fromMe: true }
    ];

    const filteredUsers = users.filter((user) => user.username !== currentUser.username);
    const seen = new Set();
    const unqueUsers = filteredUsers.filter((item) => {
        const key = item.username;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    return (
        <div className={styles.chatContainer}>
            <div className={styles.header}>
                <div className={styles.currentUser}>
                    {currentUser ? `${currentUser.username} - Online` : 'Bekleniyor...'}
                </div>
                <div className={styles.roomActions}>
                    <button className={`${styles.button} ${styles.createRoom}`}>Create Room</button>
                    <button className={`${styles.button} ${styles.joinRoom}`}>Join Room</button>
                </div>
            </div>
            <div className={styles.mainContent}>
                <div className={styles.userList}>
                    {unqueUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`${styles.user} ${selectedUser && selectedUser.id === user.id ? styles.selectedUser : ''}`}
                            onClick={() => selectUser(user)}
                        >
                            <div className={styles.userName}>{user.username}</div>
                            <div className={styles.userStatus}>
                                {user.online ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.messageArea}>
                    {dummyMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${msg.fromMe ? styles.fromUser : styles.fromOthers}`}
                        >
                            {msg.content}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.inputArea}>
                <input
                    type='text'
                    placeholder='Type a message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.messageInput}
                />
                <button onClick={sendMessage} className={styles.sendButton}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;
