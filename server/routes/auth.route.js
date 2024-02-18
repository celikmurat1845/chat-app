const router = require('express').Router();
const { loginController, verifyToken } = require('../controllers/auth.controller');

router.post('/login', loginController).get('/verify-token', verifyToken);

module.exports = router;
