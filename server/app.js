const express = require('express');
const cors = require('cors');
// const path = require('path');
const helmet = require('helmet');
const { API_PREFIX, API_VERSION } = require('./constants');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');

const app = express();

app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            objectSrc: ['none'],
            upgradeInsecureRequests: []
        },
        reportOnly: false
    })
);

// app.use(express.static(path.join(__dirname, "../client/build")));

const URL_PREFIX = `${API_PREFIX}${API_VERSION}`;
app.use(`${URL_PREFIX}/auth`, authRoutes);
app.use(`${URL_PREFIX}/users`, userRoutes);

app.all('*', (_req, res) => {
    return res.status(404).end();
});

module.exports = app;
