const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.loginController = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                username
            }
        });
        return res.status(200).send({ message: 'success', data: user });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user.' });
    }
};
