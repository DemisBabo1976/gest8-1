const express = require('express');
const router = express.Router();
const fedeltaController = require('../../controllers/fedelta/fedeltaController');

// Rotte per il programma fedeltà
router.get('/', fedeltaController.getProgrammaFedelta); // GET /api/fedelta
router.put('/', fedeltaController.updateProgrammaFedelta); // PUT /api/fedelta

// Rotte per le campagne
router.post('/campagne', fedeltaController.addCampagna); // POST /api/fedelta/campagne
router.put('/campagne/:campagnaId', fedeltaController.updateCampagna); // PUT /api/fedelta/campagne/:campagnaId
router.delete('/campagne/:campagnaId', fedeltaController.deleteCampagna); // DELETE /api/fedelta/campagne/:campagnaId

// Rotte per le regole badge
router.put('/regole-badge', fedeltaController.updateRegoleBadge); // PUT /api/fedelta/regole-badge

module.exports = router;