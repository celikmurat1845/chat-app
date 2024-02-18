const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader)
        return res.status(403).send({ message: 'A token is required for authentication' });
    const token = bearerHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({ message: 'Invalid Token' });
    }
};

module.exports = verifyToken;
