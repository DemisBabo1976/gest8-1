const mongoose = require('mongoose');
const ConfigurazioneOrari = require('../../models/ordini/configurazioneOrariModel');

// @desc    Ottieni tutte le configurazioni orari
// @route   GET /api/ordini/configurazione
// @access  Private
exports.getConfigurazioni = async (req, res) => {
  try {
    const configurazioni = await ConfigurazioneOrari.find().sort({ giorno: 1 });
    
    if (configurazioni.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Nessuna configurazione trovata'
      });
    }
    
    res.status(200).json({
      success: true,
      data: configurazioni
    });
  } catch (error) {
    console.error('Errore nel recupero delle configurazioni:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server nel recupero delle configurazioni'
    });
  }
};

// @desc    Ottieni configurazione per un giorno specifico
// @route   GET /api/ordini/configurazione/:giorno
// @access  Private
exports.getConfigurazioneGiorno = async (req, res) => {
  try {
    const giorno = parseInt(req.params.giorno);
    
    if (isNaN(giorno) || giorno < 0 || giorno > 6) {
      return res.status(400).json({
        success: false,
        message: 'Giorno non valido. Deve essere un numero da 0 (Lunedì) a 6 (Domenica)'
      });
    }
    
    const configurazione = await ConfigurazioneOrari.findOne({ giorno });
    
    if (!configurazione) {
      return res.status(404).json({
        success: false,
        message: `Configurazione non trovata per il giorno ${giorno}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: configurazione
    });
  } catch (error) {
    console.error('Errore nel recupero della configurazione del giorno:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server nel recupero della configurazione'
    });
  }
};

// @desc    Aggiorna configurazione per un giorno
// @route   PUT /api/ordini/configurazione/:giorno
// @access  Private
exports.updateConfigurazioneGiorno = async (req, res) => {
  try {
    const giorno = parseInt(req.params.giorno);
    
    if (isNaN(giorno) || giorno < 0 || giorno > 6) {
      return res.status(400).json({
        success: false,
        message: 'Giorno non valido. Deve essere un numero da 0 (Lunedì) a 6 (Domenica)'
      });
    }
    
    const configurazione = await ConfigurazioneOrari.findOneAndUpdate(
      { giorno }, 
      req.body, 
      { 
        new: true,  // Restituisce il documento aggiornato
        upsert: true, // Crea un nuovo documento se non esiste
        runValidators: true  // Esegue la validazione dello schema
      }
    );
    
    res.status(200).json({
      success: true,
      data: configurazione
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della configurazione:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server nell\'aggiornamento della configurazione'
    });
  }
};

// @desc    Copia configurazione a tutti i giorni
// @route   POST /api/ordini/configurazione/:giorno/copia-a-tutti
// @access  Private
exports.copiaConfigurazioneATutti = async (req, res) => {
  try {
    const giorno = parseInt(req.params.giorno);
    
    if (isNaN(giorno) || giorno < 0 || giorno > 6) {
      return res.status(400).json({
        success: false,
        message: 'Giorno non valido. Deve essere un numero da 0 (Lunedì) a 6 (Domenica)'
      });
    }
    
    const configurazioneDaCopiare = await ConfigurazioneOrari.findOne({ giorno });
    
    if (!configurazioneDaCopiare) {
      return res.status(404).json({
        success: false,
        message: 'Configurazione da copiare non trovata'
      });
    }
    
    // Copia la configurazione per tutti i giorni
    const updatePromises = [];
    for (let i = 0; i < 7; i++) {
      if (i !== giorno) {
        updatePromises.push(
          ConfigurazioneOrari.findOneAndUpdate(
            { giorno: i }, 
            { 
              ...configurazioneDaCopiare.toObject(),
              giorno: i,
              nomeGiorno: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'][i]
            }, 
            { 
              upsert: true, 
              new: true 
            }
          )
        );
      }
    }
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Configurazione copiata a tutti i giorni con successo'
    });
  } catch (error) {
    console.error('Errore nella copia della configurazione:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server nella copia della configurazione'
    });
  }
};

// Metodi segnaposto per completare l'esportazione
exports.getSlotOrari = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Metodo non ancora implementato'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli slot orari'
    });
  }
};

exports.getFestivita = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Metodo non ancora implementato'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle festività'
    });
  }
};

exports.addFestivita = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      data: [],
      message: 'Metodo non ancora implementato'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiunta delle festività'
    });
  }
};

exports.deleteFestivita = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Metodo non ancora implementato'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione delle festività'
    });
  }
};

// Aggiungi questa riga alla fine del file per esportare esplicitamente tutti i metodi
module.exports = {
  getConfigurazioni: exports.getConfigurazioni,
  getConfigurazioneGiorno: exports.getConfigurazioneGiorno,
  updateConfigurazioneGiorno: exports.updateConfigurazioneGiorno,
  copiaConfigurazioneATutti: exports.copiaConfigurazioneATutti,
  getSlotOrari: exports.getSlotOrari,
  getFestivita: exports.getFestivita,
  addFestivita: exports.addFestivita,
  deleteFestivita: exports.deleteFestivita
};
// Aggiungi gli altri metodi esistenti come getSlotOrari, getFestivita, ecc.
// Questi dovrebbero essere implementati in modo simile