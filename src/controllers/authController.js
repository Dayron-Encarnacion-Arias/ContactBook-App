const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../data/db');
const AppError = require('../utils/AppError');

exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;
    
    if (db.users.find(u => u.email === email)) {
        return next(new AppError('El correo ya está registrado', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: db.userIdCounter++,
        name,
        email,
        password: hashedPassword,
        role: 'member' // Nunca se acepta del body
    };
    
    db.users.push(newUser);
    res.status(201).json({ status: 'success', data: { user: { id: newUser.id, name, email, role: newUser.role } } });
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Correo o contraseña incorrectos', 401));
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ status: 'success', token });
};