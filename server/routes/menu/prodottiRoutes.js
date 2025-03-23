const express = require('express');
const router = express.Router();
const prodottiController = require('../../controllers/menu/prodottiController');
const { uploadMenuImage } = require('../../middlewares/uploadMiddleware');

// Rotte base per i prodotti
router.get('/', prodottiController.getProdotti);
router.post('/', uploadMenuImage.single('immagine'), prodottiController.createProdotto);
router.get('/:id', prodottiController.getProdotto);
router.put('/:id', uploadMenuImage.single('immagine'), prodottiController.updateProdotto);
router.delete('/:id', prodottiController.deleteProdotto);

// Rotte aggiuntive
router.patch('/:id/toggle-attivo', prodottiController.toggleProdottoAttivo);
router.patch('/:id/toggle-promozione', prodottiController.toggleProdottoPromozione);

module.exports = router;