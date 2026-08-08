const db = require('../data/db');
const AppError = require('../utils/AppError');

exports.getAllContacts = (req, res) => {
    res.status(200).json({ status: 'success', results: db.contacts.length, data: { contacts: db.contacts } });
};

exports.getContact = (req, res, next) => {
    const contact = db.contacts.find(c => c.id === parseInt(req.params.id));
    if (!contact) return next(new AppError('Contacto no encontrado', 404));
    res.status(200).json({ status: 'success', data: { contact } });
};

exports.createContact = (req, res) => {
    const newContact = {
        id: db.contactIdCounter++,
        fullName: req.body.fullName,
        phone: req.body.phone,
        email: req.body.email || null,
        category: req.body.category || 'otro',
        userId: req.user.id // Relacionado al usuario autenticado
    };
    db.contacts.push(newContact);
    res.status(201).json({ status: 'success', data: { contact: newContact } });
};

exports.updateContact = (req, res, next) => {
    const index = db.contacts.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) return next(new AppError('Contacto no encontrado', 404));

    const updatedContact = { ...db.contacts[index], ...req.body };
    db.contacts[index] = updatedContact;
    res.status(200).json({ status: 'success', data: { contact: updatedContact } });
};

exports.deleteContact = (req, res, next) => {
    const index = db.contacts.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) return next(new AppError('Contacto no encontrado', 404));

    db.contacts.splice(index, 1);
    res.status(204).send();
};