const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Importaciones de archivos locales
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { requestTimer } = require('./middlewares/customMiddleware');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// 1. Configuración de Morgan con stream hacia logs/access.log (la carpeta se crea si no existe)
const logsDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' } // 'a' significa append (agrega al final del archivo sin sobreescribir)
);

// 2. Middlewares Globales de terceros
app.use(helmet());
// CORS_ORIGIN limita qué frontend puede llamar a la API (por defecto, cualquiera)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
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

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '¡La API de ContactBook está funcionando!'
    });
});

// 5. Rutas
app.use('/auth', authRoutes);
app.use('/contacts', contactLimiter, contactRoutes);

// 6. Manejo de Errores (deben ir al final)
app.use(notFound);
app.use(errorHandler);

// Exportamos la app configurada
module.exports = app;