const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importaciones de archivos locales
const { errorHandler, notFound } = require('./src/middlewares/errorHandler');
const { requestTimer } = require('./src/middlewares/customMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();

// 1. Middlewares Globales de terceros
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 2. Middlewares personalizados globales
app.use(requestTimer); 

// 3. Rate Limiting (específico para contactos)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
});

// 4. Rutas
app.use('/auth', authRoutes);
app.use('/contacts', contactLimiter, contactRoutes);

// 5. Manejo de Errores (deben ir al final)
app.all('*', notFound);
app.use(errorHandler);

// Exportamos la app configurada
module.exports = app;