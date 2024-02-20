import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import styles from './Chat.module.css';

const SOCKET_SERVER_URL = 'http://localhost:8000';
let newSocket;
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

    const sendMessage = () => {
        if (message.trim() && (selectedUser || selectedRoom) && socket) {
            let msgToSend = {
                content: message,
                sender: currentUser.username,
                fromMe: true
            };
            console.log(selectedRoom);
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
                console.log(msgToSend);
            }

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

    const createRoom = () => {
        const roomName = prompt('Please enter room name:');
        if (roomName && socket) {
            socket.emit('create room', roomName);
        }
    };

    const selectRoom = (room) => {
        console.log(room);
        setSelectedRoom(room);
        setSelectedUser(null);
        const ifMember = room.members.includes(socket.id);
        if (!ifMember) {
            socket.emit('join room', room.id);
        }
        const roomMessages = allMessages.filter((msg) => msg.sender === room.id);
        setDisplayedMessages(roomMessages);
    };

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    useEffect(() => {
        if (isAuthenticated) {
            newSocket = io(SOCKET_SERVER_URL, {
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

            newSocket.on('room created', (room) => {
                setRooms((prevRooms) => [...prevRooms, room]);
            });

            // newSocket.on('receive room message', (msg) => {
            //     console.log(msg, selectedRoom);
            //     setRooms((prevRooms) =>
            //         prevRooms.map((room) =>
            //             room.id === msg.room ? { ...room, newMessage: true } : room
            //         )
            //     );
            //     const newMessage = {
            //         content: msg.message.content,
            //         sender: msg.sender,
            //         room: msg.room,
            //         fromMe: msg.sender === socket.id
            //     };
            //     setAllMessages((prevMessages) => [...prevMessages, newMessage]);
            //     console.log(selectedRoom);
            //     if (selectedRoom && selectedRoom.id === msg.room) {
            //         setDisplayedMessages((prevMessages) => [...prevMessages, newMessage]);
            //     }
            // });

            newSocket.on('room joined', (room) => {
                console.log('Joined room:', room);
                setSelectedRoom(room);
                let otherRooms = rooms.filter((r) => r.id !== room.id);
                otherRooms.push(room);
                setRooms(otherRooms);
                const roomMessages = allMessages.filter((msg) => msg.room === room.id);
                setDisplayedMessages(roomMessages);
            });

            return () => newSocket.close();
        }
    }, [isAuthenticated, currentUser?.username]);

    useEffect(() => {
        newSocket.on('receive room message', (msg) => {
            console.log(msg, selectedRoom);
            setRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === msg.room ? { ...room, newMessage: true } : room
                )
            );
            const newMessage = {
                content: msg.message.content,
                sender: msg.sender,
                room: msg.room,
                fromMe: msg.sender === socket.id
            };
            setAllMessages((prevMessages) => [...prevMessages, newMessage]);
            console.log(selectedRoom);
            if (selectedRoom && selectedRoom.id === msg.room) {
                setDisplayedMessages((prev) => [...prev, newMessage]);
            }
        });
    }, selectedRoom);

    return (
        <div className={styles.chatContainer}>
            <div className={styles.header}>
                <div className={styles.currentUser}>
                    {currentUser ? `${currentUser.username} - Online` : 'Bekleniyor...'}
                </div>
                <div className={styles.roomActions}>
                    <button
                        onClick={createRoom}
                        className={`${styles.button} ${styles.createRoom}`}
                    >
                        Create Room
                    </button>
                    <button className={`${styles.button} ${styles.joinRoom}`}>Join Room</button>
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
