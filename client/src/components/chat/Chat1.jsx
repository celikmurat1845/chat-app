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
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    const sendMessage = () => {
        if (message.trim() && selectedUser && socket) {
            const msgToSend = {
                content: message,
                sender: currentUser.username,
                receiver: selectedUser.username,
                fromMe: true
            };
            console.log('selectedUser', selectedUser, msgToSend);
            socket.emit('private message', {
                toUserId: selectedUser.id,
                message: msgToSend
            });
            // setMessages((prevMessages) => [...prevMessages, msgToSend]);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    ...msgToSend,
                    fromUserId: socket.id
                }
            ]);
            setMessage('');
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setMessages([]);
    };

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    useEffect(() => {
        if (isAuthenticated) {
            const newSocket = io(SOCKET_SERVER_URL, {
                withCredentials: true,
                query: { token: localStorage.getItem('token') }
            });

            newSocket.on('user info', (userInfo) => {
                setCurrentUser(userInfo);
            });

            newSocket.on('users', (usersList) => {
                setUsers(usersList.filter((user) => user.username !== currentUser?.username));
            });

            newSocket.on('receive message', (msg) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        content: msg.message,
                        sender: msg.sender,
                        receiver: currentUser.username,
                        fromMe: msg.sender === currentUser.username
                    }
                ]);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [isAuthenticated, currentUser?.username]);

    // const filteredUsers = users.filter((user) => user.username !== currentUser.username);
    // const seen = new Set();
    // const unqueUsers = filteredUsers.filter((item) => {
    //     const key = item.username;
    //     if (seen.has(key)) {
    //         return false;
    //     }
    //     seen.add(key);
    //     return true;
    // });
    console.log('messages', messages);
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
                    {users.map((user) => (
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
                    {messages.map((msg, index) => (
                        <div
                            key={index}
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
