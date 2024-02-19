const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllUsers = async (_req, res) => {
    try {
        const data = await prisma.user.findMany();

        if (!data) {
            res.status(500).json({ error: 'There are no users' });
        }

        res.status(200).send({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};

exports.deleteAllUsers = async (_req, res) => {
    try {
        await prisma.user.deleteMany();

        res.status(200).send({ status: 'success', data: 'All users deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete users.' });
    }
};
