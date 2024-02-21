import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import styles from './Chat.module.css';
import { SOCKET_URL } from '../../config';


const SOCKET_SERVER_URL = SOCKET_URL;

function Chat() {
    const { isAuthenticated } = useAuth();

    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [allMessages, setAllMessages] = useState([]);
    const [displayedMessages, setDisplayedMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const selectedRoomRef = useRef(selectedRoom);
    const myIdRef = useRef('');
    const selectedUserRef = useRef(selectedUser);


    const sendMessage = () => {
        if (message.trim() && (selectedUser || selectedRoom) && socket) {
            let msgToSend = {
                content: message,
                sender: currentUser.username,
                fromMe: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            if (selectedUser) {
                msgToSend = { ...msgToSend, receiver: selectedUser.username };
                socket.emit('private message', {
                    toUserId: selectedUser.id,
                    message: msgToSend
                });
            } else if (selectedRoom) {
                socket.emit('send message to room', {
                    roomId: selectedRoom.id,
                    message: msgToSend
                });
                msgToSend = { ...msgToSend, room: selectedRoom.id };
            }

            setAllMessages((prevMessages) => [...prevMessages, msgToSend]);
            if (selectedUserRef.current && !selectedUserRef.current.members) {
                setDisplayedMessages((prevMessages) => [...prevMessages, msgToSend]);
            }
            setMessage('');
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        selectedUserRef.current = user;
        setSelectedRoom(null);
        selectedRoomRef.current = null;
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

    const createRoom = () => {
        const roomName = prompt('Please enter room name:');
        if (roomName && socket) {
            socket.emit('create room', roomName);
        }
    };

    const selectRoom = (room) => {
        setSelectedRoom(room);
        selectedRoomRef.current = room;
        setSelectedUser(null);
        selectedUserRef.current = null;
        socket.emit('join room', room.id);

        const roomMessages = allMessages.filter((msg) => msg.sender === room.id);
        setDisplayedMessages(roomMessages);
    };

    const leaveRoom = () => {
        if (selectedRoom && socket) {
            socket.emit('leave room', selectedRoom.id);
            setSelectedRoom(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
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

            newSocket.on('connect', () => {
                myIdRef.current = newSocket.io.engine.id;
            });

            newSocket.on('user info', (userInfo) => {
                setCurrentUser(userInfo);
            });

            newSocket.on('users', (usersList) => {
                setUsers(usersList.filter((user) => user.username !== currentUser?.username));
            });

            newSocket.on('room created', (room) => {
                setRooms((prevRooms) => [...prevRooms, room]);
            });

            newSocket.on('receive message', (msg) => {
                const newMessage = {
                    content: msg.message,
                    sender: msg.sender,
                    receiver: currentUser.username,
                    fromMe: msg.sender === myIdRef.current,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setAllMessages((prevMessages) => [...prevMessages, newMessage]);
                if (
                    selectedUserRef.current &&
                    (msg.sender === selectedUserRef.current.username ||
                        msg.receiver === selectedUserRef.current.username)
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

            newSocket.on('receive room message', (msg) => {
                const newMessage = {
                    content: msg.message.content,
                    sender: msg.sender,
                    room: msg.room,
                    fromMe: msg.message.sender === currentUser.username,
                    owner: msg.message.sender
                };
                setAllMessages((prevMessages) => [...prevMessages, newMessage]);
                if (selectedRoomRef.current && selectedRoomRef.current.id === msg.room) {
                    setDisplayedMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });

            newSocket.on('room joined', (room) => {
                setSelectedRoom(room);
                selectedRoomRef.current = room;
                const roomMessages = allMessages.filter((msg) => msg.room === room.id);
                setDisplayedMessages((prev) => [...prev, roomMessages]);
            });

            newSocket.on('user left room', ({ room, username }) => {
                if (username !== currentUser?.username) {
                    alert(`${username} left the room ${room.name}`);
                }
            });

            newSocket.on('you left room', ({ room }) => {
                alert(`You left the room ${room.name}`);
                setSelectedRoom(null);
                setDisplayedMessages([]);
                // setRooms((prevRooms) => prevRooms.filter((r) => r.id !== room.id));
            });

            return () => newSocket.close();
        }
    }, [isAuthenticated, currentUser?.username]);

    return (
        <div className={styles.chatContainer}>
            <div className={styles.header}>
                <div className={styles.currentUser}>
                    {currentUser ? `${currentUser.username} - Online` : 'Pending...'}
                </div>
                <div className={styles.roomActions}>
                    <button
                        onClick={createRoom}
                        className={`${styles.button} ${styles.createRoom}`}
                    >
                        Create Room
                    </button>
                    <button
                        onClick={leaveRoom}
                        className={`${styles.button} ${styles.joinRoom}`}
                    >
                        Leave Room
                    </button>
                </div>
            </div>
            <div className={styles.mainContent}>
                <div className={styles.userList}>
                    <div className={styles.roomsList}>
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`${styles.room} ${selectedRoom && selectedRoom.id === room.id ? styles.selectedRoom : ''}`}
                                onClick={() => selectRoom(room)}
                            >
                                room - {room.name}
                            </div>
                        ))}
                    </div>
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
                    {displayedMessages.filter(msg => msg.content).map((msg, index) => (
                        <div
                            key={index}
                            className={`${styles.message} ${msg.fromMe ? styles.fromUser : styles.fromOthers}`}
                        >
                            {msg.content}
                            <div className={styles.messageInfo}>
                                {selectedUser && <span className={styles.messageSender}>{msg.time}</span>}
                                {!msg.fromMe && selectedRoom && <span className={styles.messageSender}>{msg.owner}</span>}
                            </div>
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
                    onKeyDown={handleKeyDown}
                />
                <button onClick={sendMessage} className={styles.sendButton}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;
