const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

const socketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    let connectedUsers = [];
    const roomUsers = {};

    io.on('connection', (socket) => {
        // eslint-disable-next-line no-console
        console.log(`new user connected : ${socket.id}`);

        try {
            const token = socket.handshake.query.token;

            if (!token) {
                // eslint-disable-next-line no-console
                console.log('Token sağlanmadı.');
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
                    console.error('Kullanıcı bilgisi çekilemedi:', error);
                });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Token doğrulanamadı:', error);
        }

        // socket.on('chat message', (msg) => {
        //     // eslint-disable-next-line no-console
        //     console.log(`Message received : ${msg}`);
        //     io.emit('chat message', msg);
        // });

        // socket.on('typing', () => {
        //     // eslint-disable-next-line no-console
        //     console.log('typing...');
        //     socket.broadcast.emit('typing');
        // });

        // socket.on('stop typing', () => {
        //     // eslint-disable-next-line no-console
        //     console.log('stop typing...');
        //     socket.broadcast.emit('stop typing');
        // });

        socket.on('private message', ({ toUserId, message }) => {
            socket.to(toUserId).emit('receive private message', {
                fromUserId: socket.id,
                message: message
            });
        });

        socket.on('online', (userId) => {
            // eslint-disable-next-line no-console
            console.log(`${userId} is online.`);
        });

        socket.on('send message', ({ room, message }) => {
            io.to(room).emit('receive message', message);
        });

        socket.on('create room', (room) => {
            socket.join(room);
            roomUsers[room] = (roomUsers[room] || []).concat(socket.id);
            // eslint-disable-next-line no-console
            console.log(`Room created: ${room}`);
        });

        socket.on('join room', (room) => {
            socket.join(room);
            roomUsers[room] = (roomUsers[room] || []).concat(socket.id);
            // eslint-disable-next-line no-console
            console.log(`${socket.id} joined room: ${room}`);
        });

        socket.on('leave room', (room) => {
            socket.leave(room);
            roomUsers[room] = (roomUsers[room] || []).filter((id) => id !== socket.id);
            // eslint-disable-next-line no-console
            console.log(`${socket.id} left room: ${room}`);
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
