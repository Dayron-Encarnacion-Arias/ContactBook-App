const mongoose = require('mongoose');

// Conexión a MongoDB: la URI llega por variable de entorno (en Docker apunta a mongo:27017)
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('Falta la variable de entorno MONGO_URI');
    }

    await mongoose.connect(uri);
    console.log(`✅ Conectado a MongoDB (${mongoose.connection.host}/${mongoose.connection.name})`);
};

module.exports = connectDB;
