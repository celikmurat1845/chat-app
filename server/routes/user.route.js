const router = require('express').Router();
const { getAllUsers, deleteAllUsers } = require('../controllers/user.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');

router.get('/', verifyToken, getAllUsers).delete('/', verifyToken, deleteAllUsers);

module.exports = router;
