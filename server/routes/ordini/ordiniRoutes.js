const express = require('express');
const router = express.Router();

// Importiamo i controller
const {
  getOrdini,
  getOrdine,
  createOrdine,
  updateOrdine,
  updateStatoOrdine,
  deleteOrdine,
  getStatisticheOrdini
} = require('../../controllers/ordini/ordiniController');

const {
  getConfigurazioni,
  getConfigurazioneGiorno,
  updateConfigurazioneGiorno,
  copiaConfigurazioneATutti,
  getSlotOrari,
  getFestivita,
  addFestivita,
  deleteFestivita
} = require('../../controllers/ordini/configurazioneOrariController');

// Rotte per la gestione delle configurazioni orari
router.route('/configurazione')
  .get(getConfigurazioni);

router.route('/configurazione/:giorno')
  .get(getConfigurazioneGiorno)
  .put(updateConfigurazioneGiorno);

router.route('/configurazione/:giorno/copia-a-tutti')
  .post(copiaConfigurazioneATutti);

// Rotte per la gestione degli slot orari
router.route('/slots')
  .get(getSlotOrari);

// Rotte per la gestione delle festività
router.route('/festivita')
  .get(getFestivita)
  .post(addFestivita);

router.route('/festivita/:data')
  .delete(deleteFestivita);

// Rotte per le statistiche
router.route('/statistiche/riassunto')
  .get(getStatisticheOrdini);

// Rotte per la gestione degli ordini
router.route('/')
  .get(getOrdini)
  .post(createOrdine);

router.route('/:id')
  .get(getOrdine)
  .put(updateOrdine)
  .delete(deleteOrdine);

router.route('/:id/stato')
  .patch(updateStatoOrdine);

module.exports = router;