const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const CLIENT_URL = require('./config/index');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

const socketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    let connectedUsers = [];
    let rooms = [];
    const roomUsers = {};

    io.on('connection', (socket) => {
        // eslint-disable-next-line no-console
        console.log(`new user connected : ${socket.id}`);

        try {
            const token = socket.handshake.query.token;

            if (!token) {
                // eslint-disable-next-line no-console
                console.log('Missing Token');
                return;
            }
            const decoded = jwt.verify(token, SECRET_KEY);
            const userId = decoded.userId;

            prisma.user
                .findUnique({
                    where: { id: userId }
                })
                .then((user) => {
                    socket.emit('user info', {
                        id: user.id,
                        username: user.username,
                        online: true
                    });

                    connectedUsers.push({
                        id: socket.id,
                        username: user.username,
                        online: true
                    });

                    io.emit('users', connectedUsers);
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error('User not found:', error);
                });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Token verification failed:', error);
        }

        socket.on('private message', ({ toUserId, message }) => {
            const receiverSocketId = connectedUsers.find((user) => user.id === toUserId).id;
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive message', {
                    fromUserId: socket.id,
                    message: message.content,
                    sender: message.sender,
                    receiver: message.receiver,
                    fromMe: false
                });
            }
        });

        socket.on('create room', (roomName) => {
            const room = {
                id: 'id' + Math.random().toString(16).slice(2),
                name: roomName,
                members: [socket.id]
            };
            rooms.push(room);
            socket.join(room.id);
            io.emit('room created', room);
        });

        socket.on('join room', (roomId) => {
            const room = rooms.find((r) => r.id === roomId);
            if (room) {
                room.members.push(socket.id);
                socket.join(roomId);
                io.to(roomId).emit('room joined', room);
            }
        });

        socket.on('send message to room', ({ roomId, message }) => {
            io.to(roomId).emit('receive room message', {
                sender: socket.id,
                message,
                room: roomId
            });
        });

        socket.on('leave room', (roomId) => {
            const room = rooms.find((r) => r.id === roomId);
            if (room) {
                const leftUser = room.members.filter((memberId) => memberId === socket.id);
                room.members = room.members.filter((memberId) => memberId !== socket.id);

                socket.leave(leftUser);

                const user = connectedUsers.find((u) => u.id === socket.id);
                room.members.forEach((memberId) => {
                    io.to(memberId).emit('user left room', { room, username: user.username });
                });

                socket.emit('you left room', { room });
            }
        });

        socket.on('disconnect', () => {
            // eslint-disable-next-line no-console
            console.log(`user disconnected : ${socket.id}`);

            connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);

            io.emit('users', connectedUsers);

            Object.keys(roomUsers).forEach((room) => {
                roomUsers[room] = (roomUsers[room] || []).filter((id) => id !== socket.id);
            });
        });
    });
};

module.exports = socketServer;
