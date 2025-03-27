const express = require('express');
const router = express.Router();

// Importa i controller
const {
  getClienti,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  searchClienti
} = require('../../controllers/clienti/clientiController');

// Route per ottenere tutti i clienti
router.route('/')
  .get(getClienti)     // GET /api/clienti
  .post(createCliente); // POST /api/clienti

// Route per cercare clienti
router.route('/search')
  .get(searchClienti);  // GET /api/clienti/search?q=...

// Route per un singolo cliente
router.route('/:id')
  .get(getCliente)       // GET /api/clienti/:id
  .put(updateCliente)    // PUT /api/clienti/:id
  .delete(deleteCliente); // DELETE /api/clienti/:id

module.exports = router;