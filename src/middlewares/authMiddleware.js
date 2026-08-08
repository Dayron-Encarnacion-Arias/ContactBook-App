const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const db = require('../data/db');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No estás autenticado. Por favor inicia sesión.', 401));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = db.users.find(u => u.id === decoded.id);
        if (!user) return next(new AppError('El usuario ya no existe.', 401));
        
        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Token inválido o expirado.', 401));
    }
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('No tienes permisos para realizar esta acción.', 403));
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };