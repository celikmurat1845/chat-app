const express = require('express');
const cors = require('cors');
// const path = require('path');
const helmet = require('helmet');

const app = express();

app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            // defaultSrc: ["'self'"],
            // scriptSrc: ["'self'", "http://localhost:3000"],
            objectSrc: ['none'],
            upgradeInsecureRequests: []
        },
        reportOnly: false
    })
);

// app.use(express.static(path.join(__dirname, "../client/build")));

app.get('/', (_req, res) => {
    return res.json({ message: 'Welcome!' });
});

app.all('*', (_req, res) => {
    return res.status(404).end();
});

module.exports = app;
