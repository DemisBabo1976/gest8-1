const express = require('express');
const router = express.Router();
const Cliente = require('../models/clienti/clienteModel');
const Prodotto = require('../models/menu/prodottoModel');

// Endpoint per ottenere tutti i dati della dashboard
router.get('/', async (req, res) => {
  try {
    // Dati clienti
    const clienti = await Cliente.find();
    const clientiBadges = {
      badgeVip: await Cliente.countDocuments({ badge: 'vip' }),
      badgeOro: await Cliente.countDocuments({ badge: 'oro' }),
      badgeArgento: await Cliente.countDocuments({ badge: 'argento' }),
      badgeBronzo: await Cliente.countDocuments({ badge: 'bronzo' })
    };
    
    // Dati prodotti menu
    const prodotti = await Prodotto.find();
    const prodottiNascosti = await Prodotto.countDocuments({ attivo: false });
    const prodottiPromozione = await Prodotto.countDocuments({ inPromozione: true });
    
    // Calcola la pizza più venduta (simulato per ora)
    const piuVenduta = prodotti.length > 0 ? prodotti[0].nome : 'Margherita';
    
    // Dati simulati degli ordini - in una implementazione reale verrebbero dal database
    const datiSimulati = {
      ordiniOggi: 42,
      ordiniAsporto: 18,
      ordiniConsegna: 14,
      ordiniRitiro: 6,
      ordiniOnline: 4,
      ordiniInPreparazione: 5,
      ordiniInArrivo: 3,
      ordiniCompletati: 34,
      incassoContanti: 620,
      incassoCarte: 480,
      incassoDigitale: 90,
      incassoBuoniPasto: 60,
      incassoTotale: 1250,
      clientiConsegne: 14,
      campagnaWhatsapp: 38,
      campagnaSocial: 12,
      campagnaWebApp: 16,
      puntiTotali: 3450,
      promoAttiva: "2x1 il Martedì"
    };
    
    // Costruisci la risposta
    const dashboardData = {
      ...datiSimulati,
      clientiFidelizzati: clienti.length,
      clientiRaccoltaPunti: clienti.filter(c => c.punti > 0).length,
      ...clientiBadges,
      prodottiNascosti,
      prodottiPromozione,
      piuVenduta,
      ultimoAggiornamento: new Date()
    };
    
    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero dati dashboard', 
      error: error.message 
    });
  }
});

// Endpoint per aggiornare i dati della dashboard (simulato)
router.put('/', (req, res) => {
  const updates = req.body;
  
  // In un'applicazione reale, qui aggiornereresti i dati nel database
  console.log('Aggiornamento dati ricevuto:', updates);
  
  // Simula una risposta con i dati aggiornati
  const updatedData = {
    ...updates,
    ultimoAggiornamento: new Date()
  };
  
  res.json(updatedData);
});

module.exports = router;