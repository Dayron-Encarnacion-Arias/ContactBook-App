// Middleware personalizado: Logger de tiempos de petición y middleware de ruta
const requestTimer = (req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(`[${req.requestTime}] ${req.method} a ${req.originalUrl}`);
    next();
};

const requireCustomHeader = (req, res, next) => {
    if (!req.headers['x-api-client']) {
        return res.status(400).json({ error: 'Falta el header x-api-client' });
    }
    next();
};

module.exports = { requestTimer, requireCustomHeader };