const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (await User.exists({ email: email.toLowerCase() })) {
        return next(new AppError('El correo ya está registrado', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'member' // Nunca se acepta del body
    });

    res.status(201).json({ status: 'success', data: { user: newUser } });
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Correo o contraseña incorrectos', 401));
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ status: 'success', token, data: { user } });
};
