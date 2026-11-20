// Cargar variables de entorno primero
require('dotenv').config({ quiet: true });

// Importar la app configurada
const app = require('./app');
const connectDB = require('./data/db');
const seedAdmin = require('./data/seed');

// Definir el puerto
const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        // Primero la base de datos, luego el servidor
        await connectDB();
        await seedAdmin();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
};

start();
