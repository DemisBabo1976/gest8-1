const express = require('express');
const router = express.Router();
const Cliente = require('../models/clienti/clienteModel');
const Prodotto = require('../models/menu/prodottoModel');
const Ordine = require('../models/ordini/ordineModel'); // Aggiungi questa importazione

// Endpoint per ottenere tutti i dati della dashboard
router.get('/', async (req, res) => {
  try {
    // Ottieni la data di oggi
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    const domani = new Date(oggi);
    domani.setDate(domani.getDate() + 1);
    
    // Dati clienti
    const clienti = await Cliente.find();
    const clientiBadges = {
      badgeVip: await Cliente.countDocuments({ badge: 'vip' }),
      badgeOro: await Cliente.countDocuments({ badge: 'oro' }),
      badgeArgento: await Cliente.countDocuments({ badge: 'argento' }),
      badgeBronzo: await Cliente.countDocuments({ badge: 'bronzo' })
    };
    
    // Clienti recenti
    const clientiRecenti = await Cliente.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nome cognome email telefono punti createdAt');
    
    // Dati prodotti menu
    const prodotti = await Prodotto.find();
    const prodottiNascosti = await Prodotto.countDocuments({ attivo: false });
    const prodottiPromozione = await Prodotto.countDocuments({ inPromozione: true });
    const prodottiAttivi = await Prodotto.countDocuments({ attivo: true });
    
    // Dati ordini - se il modello Ordine esiste
    let ordiniOggi = 0;
    let incassoOggi = 0;
    let ordiniAttivi = [];
    let prodottiPopolari = [];

    try {
      // Statistiche ordini
      ordiniOggi = await Ordine.countDocuments({ 
        createdAt: { $gte: oggi, $lt: domani }
      });
      
      const incassoOggiResult = await Ordine.aggregate([
        {
          $match: {
            createdAt: { $gte: oggi, $lt: domani },
            stato: { $ne: 'annullato' }
          }
        },
        {
          $group: {
            _id: null,
            totale: { $sum: '$totale' }
          }
        }
      ]);
      
      incassoOggi = incassoOggiResult.length > 0 ? incassoOggiResult[0].totale : 0;
      
      // Ordini attivi per il widget
      ordiniAttivi = await Ordine.find({
        stato: { $in: ['nuovo', 'in preparazione', 'pronto'] }
      })
      .sort({ createdAt: 1 })
      .limit(5)
      .populate('cliente', 'nome cognome');
      
      // Prodotti più popolari
      prodottiPopolari = await Ordine.aggregate([
        { $match: { stato: { $ne: 'annullato' } } },
        { $unwind: '$elementi' },
        {
          $group: {
            _id: '$elementi.prodotto',
            nome: { $first: '$elementi.nome' },
            quantita: { $sum: '$elementi.quantita' }
          }
        },
        { $sort: { quantita: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'prodotti',
            localField: '_id',
            foreignField: '_id',
            as: 'dettagliProdotto'
          }
        },
        {
          $addFields: {
            categoria: { $arrayElemAt: ['$dettagliProdotto.categoria', 0] },
            prezzo: { $arrayElemAt: ['$dettagliProdotto.prezzo', 0] }
          }
        },
        {
          $project: {
            _id: 1,
            nome: 1,
            quantita: 1,
            categoria: 1,
            prezzo: 1
          }
        }
      ]);
    } catch (e) {
      console.log('Modello Ordine non inizializzato completamente:', e.message);
      // Continua con dati simulati se ci sono errori con il modello Ordine
    }
    
    // Calcola la pizza più venduta (dai prodotti popolari o simulata)
    let piuVenduta = 'Margherita';
    if (prodottiPopolari.length > 0) {
      const pizzePopolari = prodottiPopolari.filter(p => p.categoria === 'pizza');
      if (pizzePopolari.length > 0) {
        piuVenduta = pizzePopolari[0].nome;
      }
    } else if (prodotti.length > 0) {
      piuVenduta = prodotti[0].nome;
    }
    
    // Integra i dati simulati esistenti per retrocompatibilità
    const datiSimulati = {
      ordiniOggi: ordiniOggi || 42,
      ordiniAsporto: 18,
      ordiniConsegna: 14,
      ordiniRitiro: 6,
      ordiniOnline: 4,
      ordiniInPreparazione: ordiniAttivi.filter(o => o.stato === 'in preparazione').length || 5,
      ordiniInArrivo: 3,
      ordiniCompletati: 34,
      incassoContanti: 620,
      incassoCarte: 480,
      incassoDigitale: 90,
      incassoBuoniPasto: 60,
      incassoTotale: incassoOggi || 1250,
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
      prodottiAttivi,
      piuVenduta,
      ultimoAggiornamento: new Date(),
      
      // Dati strutturati per i nuovi componenti
      statistiche: {
        clientiTotali: clienti.length,
        prodottiAttivi,
        ordiniOggi: ordiniOggi || datiSimulati.ordiniOggi,
        incassoOggi: incassoOggi || datiSimulati.incassoTotale
      },
      clientiRecenti,
      prodottiPopolari,
      ordiniAttivi
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