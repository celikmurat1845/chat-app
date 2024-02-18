const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.userController = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany();

        if (!allUsers) {
            res.status(500).json({ error: 'There are no users' });
        }

        res.status(200).send({ status: 'success', data: allUsers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};
