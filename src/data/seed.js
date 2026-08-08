const bcrypt = require('bcrypt');
const db = require('./db');

const seedAdmin = async () => {
    const adminExists = db.users.find(u => u.role === 'admin');
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.users.push({
            id: db.userIdCounter++,
            name: 'Admin User',
            email: 'admin@contactbook.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('✅ Usuario Admin sembrado con éxito.');
    }
};

module.exports = seedAdmin;