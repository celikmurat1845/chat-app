import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import styles from './Chat.module.css';

function Chat() {
    const { isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/users', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUsers(response.data.data);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };

        if (isAuthenticated) {
            fetchUsers();
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

    return (
        <div className={styles.chatContainer}>
            <div className={styles.header}>
                <div>Kullanıcı Adı - Online</div>
                <div className={styles.roomActions}>
                    <button className={`${styles.button} ${styles.createRoom}`}>Create Room</button>
                    <button className={`${styles.button} ${styles.joinRoom}`}>Join Room</button>
                </div>
            </div>
            <div className={styles.mainContent}>
                <div className={styles.userList}>
                    {users.map((user) => (
                        <div key={user.id} className={styles.user}>
                            <div className={styles.userName}>{user.username}</div>
                            <div className={styles.userStatus}>
                                {/* {user.online ? 'Online' : 'Offline'} */}
                                Online
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
        </div>
    );
}

export default Chat;
