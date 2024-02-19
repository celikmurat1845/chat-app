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
    const [allMessages, setAllMessages] = useState([]);
    const [displayedMessages, setDisplayedMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    const sendMessage = () => {
        if (message.trim() && selectedUser && socket) {
            const msgToSend = {
                content: message,
                sender: currentUser.username,
                receiver: selectedUser.username,
                fromMe: true
            };
            socket.emit('private message', {
                toUserId: selectedUser.id,
                message: msgToSend
            });
            setAllMessages((prevMessages) => [...prevMessages, msgToSend]);
            setDisplayedMessages((prevMessages) => [...prevMessages, msgToSend]);
            setMessage('');
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setUsers((prevUsers) =>
            prevUsers.map((u) => ({
                ...u,
                newMessage: u.id === user.id ? false : u.newMessage
            }))
        );
        const filteredMessages = allMessages.filter(
            (msg) => msg.sender === user.username || msg.receiver === user.username
        );
        setDisplayedMessages(filteredMessages);
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

            setSocket(newSocket);

            newSocket.on('user info', (userInfo) => {
                setCurrentUser(userInfo);
            });

            newSocket.on('users', (usersList) => {
                setUsers(usersList.filter((user) => user.username !== currentUser?.username));
            });

            newSocket.on('receive message', (msg) => {
                const newMessage = {
                    content: msg.message,
                    sender: msg.sender,
                    receiver: currentUser.username,
                    fromMe: msg.sender === currentUser.username
                };
                setAllMessages((prevMessages) => [...prevMessages, newMessage]);
                if (
                    selectedUser &&
                    (msg.sender === selectedUser.username || msg.receiver === selectedUser.username)
                ) {
                    setDisplayedMessages((prevMessages) => [...prevMessages, newMessage]);
                } else {
                    setUsers((prevUsers) =>
                        prevUsers.map((u) => ({
                            ...u,
                            newMessage: u.username === msg.sender ? true : u.newMessage
                        }))
                    );
                }
            });

            return () => newSocket.close();
        }
    }, [isAuthenticated, currentUser?.username]);

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
                            {user.newMessage && (
                                <span className={styles.newMessageIndicator}>New</span>
                            )}
                            <div className={styles.userStatus}>
                                {user.online ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.messageArea}>
                    {displayedMessages.map((msg, index) => (
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
