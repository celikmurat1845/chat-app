const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

exports.loginController = async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required()
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return res.status(400).json({ error: errorMessage });
    }

    const { username } = value;
    try {
        const user = await prisma.user.upsert({
            where: { username: username },
            update: { updatedAt: new Date() },
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
