const express = require('express');
const router = express.Router();
const ordiniController = require('../../controllers/ordini/ordiniController');

// Rotte principali
router.route('/')
  .get(ordiniController.getOrdini)
  .post(ordiniController.createOrdine);

// Rotta per le statistiche
router.route('/statistiche')
  .get(ordiniController.getStatisticheOrdini);

// Rotte per singolo ordine
router.route('/:id')
  .get(ordiniController.getOrdine)
  .put(ordiniController.updateOrdine)
  .delete(ordiniController.deleteOrdine);

// Rotta per aggiornare lo stato di un ordine
router.route('/:id/stato')
  .put(ordiniController.updateStatoOrdine);

module.exports = router;