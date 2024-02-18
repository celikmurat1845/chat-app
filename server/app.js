const express = require('express');
const cors = require('cors');
// const path = require('path');
const helmet = require('helmet');
const { API_PREFIX, API_VERSION } = require('./constants');
const loginRoutes = require('./routes/login.route');
const userRoutes = require('./routes/user.route');

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

const URL_PREFIX = `${API_PREFIX}${API_VERSION}`;
app.use(`${URL_PREFIX}/login`, loginRoutes);
app.use(`${URL_PREFIX}/users`, userRoutes);

app.all('*', (_req, res) => {
    return res.status(404).end();
});

module.exports = app;
