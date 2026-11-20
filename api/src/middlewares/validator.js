const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Devuelve el primer error de validación como AppError
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
};

const validateContact = [
    body('fullName').notEmpty().withMessage('El nombre completo es obligatorio'),
    body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Debe ser un correo válido'),
    body('category').optional().isIn(['personal', 'trabajo', 'otro']).withMessage('Categoría inválida'),
    handleValidation
];

const validateRegister = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidation
];

const validateLogin = [
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    handleValidation
];

module.exports = { validateContact, validateRegister, validateLogin };
