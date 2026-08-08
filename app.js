const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Importaciones de archivos locales
const { errorHandler, notFound } = require('./src/middlewares/errorHandler');
const { requestTimer } = require('./src/middlewares/customMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();

// 1. Configuración de Morgan con stream hacia logs/access.log
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs', 'access.log'),
    { flags: 'a' } // 'a' significa append (agrega al final del archivo sin sobreescribir)
);

// 2. Middlewares Globales de terceros
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream })); // Registra protocolos HTTP y detalles en el archivo
app.use(morgan('dev')); // Mantiene la salida visual en la consola
app.use(express.json());

// 3. Middlewares personalizados globales
app.use(requestTimer); 

// 4. Rate Limiting (específico para contactos)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
});

// 5. Rutas
app.use('/auth', authRoutes);
app.use('/contacts', contactLimiter, contactRoutes);

// 6. Manejo de Errores (deben ir al final)
app.all('*', notFound);
app.use(errorHandler);

// Exportamos la app configurada
module.exports = app;