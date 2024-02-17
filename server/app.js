const express = require('express');
const cors = require('cors');
// const path = require('path');

const app = express();

app.use(cors());

app.use(express.json());

// app.use(express.static(path.join(__dirname, "../client/build")));

app.get('/', (_req, res) => {
    return res.status(200).send('Hello, World!');
});

app.all('*', (_req, res) => {
    return res.status(404).end();
});

module.exports = app;
