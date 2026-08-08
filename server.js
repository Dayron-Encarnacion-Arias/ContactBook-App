// Cargar variables de entorno primero
require('dotenv').config();

// Importar la app configurada
const app = require('./app');
const seedAdmin = require('./src/data/seed');

// Definir el puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    // Sembrar el usuario admin al iniciar
    await seedAdmin();
});