const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rotta per ottenere i dati della dashboard
router.get('/', dashboardController.getDashboardData);

// Rotta per aggiornare i dati della dashboard
router.put('/', dashboardController.updateDashboardData);

module.exports = router;