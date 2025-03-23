const Fedelta = require('../../models/fedelta/fedeltaModel');
const Cliente = require('../../models/clienti/clienteModel');

/**
 * Ottiene i dati del programma fedeltà
 * Se non esiste, ne crea uno con valori predefiniti
 */
exports.getProgrammaFedelta = async (req, res) => {
  try {
    let programma = await Fedelta.findOne();
    
    // Se non esiste un programma fedeltà, creane uno con valori predefiniti
    if (!programma) {
      programma = await Fedelta.create({
        nome: 'Programma Fedeltà Pizzeria',
        descrizione: 'Accumula punti e ottieni sconti e promozioni',
        attivo: true,
        puntiTotali: 0,
        regolePunti: {
          euroPerPunto: 10, // 1 punto ogni 10 euro
          puntiExtra: true,
          puntiCompleanno: 20,
          puntiRegistrazione: 10
        },
        promozioneAttuale: {
          nome: '2x1 il Martedì',
          descrizione: 'Ogni martedì, acquistando una pizza, la seconda è gratis',
          attiva: true,
          dataInizio: new Date(),
          dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Un mese di promo
        }
      });
    }
    
    // Aggiungi statistiche sui clienti
    const stats = {
      clientiTotali: await Cliente.countDocuments(),
      clientiConPunti: await Cliente.countDocuments({ punti: { $gt: 0 } }),
      badgeVip: await Cliente.countDocuments({ badge: 'vip' }),
      badgeOro: await Cliente.countDocuments({ badge: 'oro' }),
      badgeArgento: await Cliente.countDocuments({ badge: 'argento' }),
      badgeBronzo: await Cliente.countDocuments({ badge: 'bronzo' })
    };
    
    res.status(200).json({
      success: true,
      data: programma,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero dei dati del programma fedeltà', 
      error: error.message 
    });
  }
};

/**
 * Aggiorna il programma fedeltà
 */
exports.updateProgrammaFedelta = async (req, res) => {
  try {
    const updates = req.body;
    updates.ultimaModifica = new Date();
    
    const programma = await Fedelta.findOneAndUpdate(
      {}, 
      updates, 
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Programma fedeltà aggiornato con successo',
      data: programma
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'aggiornamento del programma fedeltà', 
      error: error.message 
    });
  }
};

/**
 * Aggiunge una nuova campagna al programma fedeltà
 */
exports.addCampagna = async (req, res) => {
  try {
    const programma = await Fedelta.findOne();
    
    if (!programma) {
      return res.status(404).json({
        success: false,
        message: 'Programma fedeltà non trovato'
      });
    }
    
    programma.campagneAttive.push(req.body);
    programma.ultimaModifica = new Date();
    await programma.save();
    
    res.status(201).json({
      success: true,
      message: 'Campagna aggiunta con successo',
      data: programma
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'aggiunta della campagna', 
      error: error.message 
    });
  }
};

/**
 * Modifica una campagna esistente
 */
exports.updateCampagna = async (req, res) => {
  try {
    const { campagnaId } = req.params;
    const programma = await Fedelta.findOne();
    
    if (!programma) {
      return res.status(404).json({
        success: false,
        message: 'Programma fedeltà non trovato'
      });
    }
    
    const campagnaIndex = programma.campagneAttive.findIndex(c => c._id.toString() === campagnaId);
    
    if (campagnaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Campagna non trovata'
      });
    }
    
    programma.campagneAttive[campagnaIndex] = {
      ...programma.campagneAttive[campagnaIndex].toObject(),
      ...req.body
    };
    programma.ultimaModifica = new Date();
    await programma.save();
    
    res.status(200).json({
      success: true,
      message: 'Campagna aggiornata con successo',
      data: programma
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'aggiornamento della campagna', 
      error: error.message 
    });
  }
};

/**
 * Elimina una campagna
 */
exports.deleteCampagna = async (req, res) => {
  try {
    const { campagnaId } = req.params;
    const programma = await Fedelta.findOne();
    
    if (!programma) {
      return res.status(404).json({
        success: false,
        message: 'Programma fedeltà non trovato'
      });
    }
    
    programma.campagneAttive = programma.campagneAttive.filter(
      c => c._id.toString() !== campagnaId
    );
    programma.ultimaModifica = new Date();
    await programma.save();
    
    res.status(200).json({
      success: true,
      message: 'Campagna eliminata con successo',
      data: programma
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'eliminazione della campagna', 
      error: error.message 
    });
  }
};

/**
 * Aggiorna le regole dei badge
 */
exports.updateRegoleBadge = async (req, res) => {
  try {
    const programma = await Fedelta.findOne();
    
    if (!programma) {
      return res.status(404).json({
        success: false,
        message: 'Programma fedeltà non trovato'
      });
    }
    
    programma.regoleBadge = req.body;
    programma.ultimaModifica = new Date();
    await programma.save();
    
    res.status(200).json({
      success: true,
      message: 'Regole badge aggiornate con successo',
      data: programma
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'aggiornamento delle regole badge', 
      error: error.message 
    });
  }
};