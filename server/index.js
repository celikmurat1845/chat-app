process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('There was an uncaught error', err.name, err.stack);
    process.exit(1);
});

const { createServer } = require('http');
const app = require('./app');
const socketServer = require('./socket');

const PORT = process.env.PORT || 8000;
const server = createServer(app);
socketServer(server);

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server is running on port ${PORT}`);

    // handling unhandled rejections
    process.on('unhandledRejection', (err) => {
        // eslint-disable-next-line no-console
        console.log('UNHANDLED REJECTION! 💥 Shutting down...');
        // eslint-disable-next-line no-console
        console.log(err.name, err.stack);
        server.close(() => {
            process.exit(1);
        });
    });

    // ensuring graceful shutdown in case sigterm received
    process.on('SIGTERM', () => {
        // eslint-disable-next-line no-console
        console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
        server.close(() => {
            // eslint-disable-next-line no-console
            console.log('💥 Process terminated!');
        });
    });
});
