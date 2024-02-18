const router = require('express').Router();
const { userController } = require('../controllers/user.controller');
const verifyToken = require('../middlewares/verifyToken.middleware');

router.get('/', verifyToken, userController);

module.exports = router;
