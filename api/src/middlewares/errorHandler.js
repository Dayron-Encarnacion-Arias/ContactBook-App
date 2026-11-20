const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    // Errores de Mongoose que se traducen a respuestas claras
    if (err.name === 'CastError') {
        err = new AppError('Id inválido', 400);
    } else if (err.name === 'ValidationError') {
        err = new AppError(Object.values(err.errors)[0].message, 400);
    } else if (err.code === 11000) {
        err = new AppError('El registro ya existe', 400);
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.statusCode === 500) console.error(err);

    res.status(err.statusCode).json({
        status: err.status,
        message: err.statusCode === 500 ? 'Error interno del servidor' : err.message,
    });
};

const notFound = (req, res, next) => {
    next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
};

module.exports = { errorHandler, notFound };
