const { Server } = require('socket.io');

const socketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        // eslint-disable-next-line no-console
        console.log(`new user connected : ${socket.id}`);

        socket.on('chat message', (msg) => {
            // eslint-disable-next-line no-console
            console.log(`Message received : ${msg}`);
            io.emit('chat message', msg);
        });
        socket.on('disconnect', () => {
            // eslint-disable-next-line no-console
            console.log(`user disconnected : ${socket.id}`);
        });
    });
};

module.exports = socketServer;
