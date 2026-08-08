const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateContact = [
    body('fullName').notEmpty().withMessage('El nombre completo es obligatorio'),
    body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
    body('email').optional().isEmail().withMessage('Debe ser un correo válido'),
    body('category').optional().isIn(['personal', 'trabajo', 'otro']).withMessage('Categoría inválida'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }
        next();
    }
];

module.exports = { validateContact };