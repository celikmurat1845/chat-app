const { createServer } = require('http');
const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = createServer(app);

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server is running on port ${PORT}`);
});
