const express = require('express');
const contactController = require('../controllers/contactController');
const { validateContact } = require('../middlewares/validator');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { requireCustomHeader } = require('../middlewares/customMiddleware');

const router = express.Router();

// GET público pero requiere header personalizado (Middleware de ruta)
router.get('/', requireCustomHeader, contactController.getAllContacts);
router.get('/:id', contactController.getContact);

// Protegidas con token
router.use(verifyToken);
router.post('/', validateContact, contactController.createContact);
router.put('/:id', validateContact, contactController.updateContact);

// Protegida con token y rol de Admin
router.delete('/:id', checkRole('admin'), contactController.deleteContact);

module.exports = router;