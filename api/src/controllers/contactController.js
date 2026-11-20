const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');

// Solo se aceptan del body los campos editables
const pickContactFields = (body) => {
    const fields = {};
    ['fullName', 'phone', 'email', 'category'].forEach((key) => {
        if (body[key] !== undefined) fields[key] = body[key];
    });
    return fields;
};

exports.getAllContacts = async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: contacts.length, data: { contacts } });
};

exports.getContact = async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return next(new AppError('Contacto no encontrado', 404));
    res.status(200).json({ status: 'success', data: { contact } });
};

exports.createContact = async (req, res) => {
    const newContact = await Contact.create({
        ...pickContactFields(req.body),
        userId: req.user.id // Relacionado al usuario autenticado
    });
    res.status(201).json({ status: 'success', data: { contact: newContact } });
};

exports.updateContact = async (req, res, next) => {
    const updatedContact = await Contact.findByIdAndUpdate(req.params.id, pickContactFields(req.body), {
        new: true,
        runValidators: true
    });
    if (!updatedContact) return next(new AppError('Contacto no encontrado', 404));
    res.status(200).json({ status: 'success', data: { contact: updatedContact } });
};

exports.deleteContact = async (req, res, next) => {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new AppError('Contacto no encontrado', 404));
    res.status(204).send();
};
