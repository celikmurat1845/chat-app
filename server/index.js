const { createServer } = require('http');
const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = createServer(app);
const murat = 'husky deneme';
console.log('husky deneme');

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server is running on port ${PORT}`);
});
