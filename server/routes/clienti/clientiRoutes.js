const express = require('express');
const router = express.Router();
const clientiController = require('../../controllers/clienti/clientiController');

// Rotte base per i clienti
router.get('/', clientiController.getClienti);
router.post('/', clientiController.createCliente);
router.get('/:id', clientiController.getCliente);
router.put('/:id', clientiController.updateCliente);
router.delete('/:id', clientiController.deleteCliente);

module.exports = router;