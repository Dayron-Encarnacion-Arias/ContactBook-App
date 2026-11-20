const bcrypt = require('bcrypt');
const User = require('../models/User');

// Siembra el usuario admin con las credenciales del .env si todavía no existe
const seedAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.warn('⚠️  ADMIN_EMAIL o ADMIN_PASSWORD no están definidos: no se siembra el admin.');
        return;
    }

    const adminExists = await User.exists({ role: 'admin' });
    if (adminExists) return;

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: 'admin'
    });
    console.log('✅ Usuario Admin sembrado con éxito.');
};

module.exports = seedAdmin;
