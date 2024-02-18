const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

exports.loginController = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.user.upsert({
            where: { username: username },
            update: {},
            create: {
                username: username
            }
        });

        const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: '1h'
        });

        res.status(200).send({ status: 'success', data: { username: user.username, token } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process login.' });
    }
};
