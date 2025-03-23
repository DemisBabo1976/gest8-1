const express = require('express');
const router = express.Router();
const fedeltaController = require('../../controllers/fedelta/fedeltaController');

// Rotte per il programma fedeltà
router.get('/', fedeltaController.getProgrammaFedelta);
router.put('/', fedeltaController.updateProgrammaFedelta);

// Rotte per le campagne
router.post('/campagne', fedeltaController.addCampagna);
router.put('/campagne/:campagnaId', fedeltaController.updateCampagna);
router.delete('/campagne/:campagnaId', fedeltaController.deleteCampagna);

// Rotte per le regole badge
router.put('/regole-badge', fedeltaController.updateRegoleBadge);

module.exports = router;